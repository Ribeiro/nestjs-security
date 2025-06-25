import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateValorPagamento1750869525553 implements MigrationInterface {
    name = 'UpdateValorPagamento1750869525553'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "pagamento" DROP COLUMN "valor"
        `);
        await queryRunner.query(`
            ALTER TABLE "pagamento"
            ADD "valor" numeric(10, 2) NOT NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "pagamento" DROP COLUMN "valor"
        `);
        await queryRunner.query(`
            ALTER TABLE "pagamento"
            ADD "valor" integer NOT NULL
        `);
    }

}
