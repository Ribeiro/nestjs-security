import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateHttpCallAuditTable1750885550076 implements MigrationInterface {
    name = 'CreateHttpCallAuditTable1750885550076'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "http_call_audit" (
                "id" SERIAL NOT NULL,
                "revision" integer NOT NULL,
                "entity_id" text NOT NULL,
                "action" text NOT NULL,
                "timestamp" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "user_id" text,
                "username" text,
                "diff" jsonb,
                "data" jsonb,
                "ip" text,
                CONSTRAINT "PK_697dc7687b60b77c3f0e50403fc" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_HTTP_CALL_AUDIT_ENTITY_ID" ON "http_call_audit" ("entity_id")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_HTTP_CALL_AUDIT_TIMESTAMP" ON "http_call_audit" ("timestamp")
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP INDEX "public"."IDX_HTTP_CALL_AUDIT_TIMESTAMP"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_HTTP_CALL_AUDIT_ENTITY_ID"
        `);
        await queryRunner.query(`
            DROP TABLE "http_call_audit"
        `);
    }

}
