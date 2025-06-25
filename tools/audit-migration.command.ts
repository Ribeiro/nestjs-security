import { Command, CommandRunner } from 'nest-commander';
import { Project, ClassDeclaration, SourceFile } from 'ts-morph';
import { getMetadataArgsStorage } from 'typeorm';
import { join } from 'path';
import { AUDITABLE } from '../src/decorators/auditable.decorator';

@Command({ name: 'audit:migration', description: 'Gera entidades de auditoria' })
export class AuditMigrationCommand extends CommandRunner {
  async run(): Promise<void> {
    const project = new Project({ tsConfigFilePath: 'tsconfig.json' });
    const tables = getMetadataArgsStorage().tables;

    for (const table of tables) {
      await this.processEntityIfAuditable(project, table);
    }
  }

  private async processEntityIfAuditable(project: Project, table: any) {
    const entityClass = table.target as Function;
    if (!entityClass || !Reflect.getMetadata(AUDITABLE, entityClass)) return;

    const entityName = entityClass.name;
    const auditEntityName = `${entityName}Audit`;
    const filePath = join('src', 'audit', `${auditEntityName}.ts`);

    const sourceFile = this.createAuditFile(project, filePath, auditEntityName, entityName);
    const classDecl = sourceFile.getClassOrThrow(auditEntityName);

    this.addAuditMetadataColumns(classDecl);
    this.addColumnsFromEntity(classDecl, entityClass);

    await sourceFile.save();
    console.log(`✓ ${auditEntityName} salvo em ${filePath}`);
  }

  private createAuditFile(project: Project, filePath: string, className: string, originalName: string): SourceFile {
    const sourceFile = project.createSourceFile(filePath, '', { overwrite: true });

    sourceFile.addImportDeclaration({
      moduleSpecifier: 'typeorm',
      namedImports: ['Entity', 'PrimaryGeneratedColumn', 'Column'],
    });

    sourceFile.addClass({
      name: className,
      isExported: true,
      decorators: [{ name: 'Entity', arguments: [`'${originalName.toLowerCase()}_audit'`] }],
    });

    return sourceFile;
  }

  private addColumnsFromEntity(classDecl: ClassDeclaration, entityClass: Function) {
    const columns = getMetadataArgsStorage().columns.filter(c => c.target === entityClass);
    const relations = getMetadataArgsStorage().relations.filter(r => r.target === entityClass);

    for (const column of columns) {
      const isRelation = relations.find(r => r.propertyName === column.propertyName);
      if (this.shouldMapRelationAsId(isRelation)) {
        this.addRelationIdColumn(classDecl, column.propertyName);
      } else {
        this.addStandardColumn(classDecl, column);
      }
    }
  }

  private shouldMapRelationAsId(relation: any): boolean {
    if (!relation) return false;

    try {
      const related = typeof relation.type === 'function' ? relation.type() : undefined;
      return typeof related === 'function' && Reflect.getMetadata(AUDITABLE, related);
    } catch {
      return typeof relation.type === 'function' && Reflect.getMetadata(AUDITABLE, relation.type);
    }
  }

  private addRelationIdColumn(classDecl: ClassDeclaration, propertyName: string) {
    classDecl.addProperty({
      name: `${propertyName}_id`,
      type: 'string',
      decorators: [{ name: 'Column', arguments: [`{ type: 'varchar' }`] }],
    });
  }

  private addStandardColumn(classDecl: ClassDeclaration, column: any) {
    const options = column.options ?? {};
    classDecl.addProperty({
      name: column.propertyName,
      type: this.resolveTsType(options.type),
      hasQuestionToken: !!options.nullable,
      decorators: [{ name: 'Column', arguments: [this.buildColumnArguments(options)] }],
    });
  }

  private addAuditMetadataColumns(classDecl: ClassDeclaration) {
    classDecl.addProperty({
      name: 'id',
      type: 'number',
      decorators: [{ name: 'PrimaryGeneratedColumn', arguments: [] }],
    });

    const fields = [
      { name: 'revision', type: 'number' },
      { name: 'entity_id', type: 'string' },
      { name: 'action', type: `'CREATE' | 'UPDATE' | 'DELETE'` },
      { name: 'timestamp', type: 'Date', decorators: [`{ type: 'timestamptz', default: () => "now()" }`] },
      { name: 'user_id', type: 'string', optional: true },
      { name: 'username', type: 'string', optional: true },
      { name: 'ip', type: 'string', optional: true },
    ];

    for (const field of fields) {
      classDecl.addProperty({
        name: field.name,
        type: field.type,
        hasQuestionToken: field.optional ?? false,
        decorators: [
          {
            name: 'Column',
            arguments: field.decorators ?? (field.optional ? [`{ nullable: true }`] : []),
          },
        ],
      });
    }
  }

  private resolveTsType(type: any): string {
    const typeMap: Record<string, string> = {
      varchar: 'string',
      text: 'string',
      uuid: 'string',
      int: 'number',
      integer: 'number',
      float: 'number',
      double: 'number',
      decimal: 'number',
      numeric: 'number',
      bigint: 'number',
      boolean: 'boolean',
      bool: 'boolean',
      date: 'Date',
      timestamp: 'Date',
      timestamptz: 'Date',
      json: 'any',
      jsonb: 'any',
    };
    return typeof type === 'string' ? typeMap[type] || 'any' : 'any';
  }

  private buildColumnArguments(options: any): string {
    const config: Record<string, any> = {};
    if (options.type) config.type = `'${options.type}'`;
    if (options.comment) config.comment = `'${options.comment}'`;
    if (options.nullable) config.nullable = true;

    const args = Object.entries(config)
      .map(([k, v]) => `${k}: ${v}`)
      .join(', ');

    return args.length > 0 ? `{ ${args} }` : '';
  }
}
