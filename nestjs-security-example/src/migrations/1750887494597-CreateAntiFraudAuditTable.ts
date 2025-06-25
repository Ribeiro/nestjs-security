import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateAntiFraudAuditTable1750887494597 implements MigrationInterface {
    name = 'CreateAntiFraudAuditTable1750887494597'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "anti_fraud_audit" (
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
                CONSTRAINT "PK_c7131db273685bc652b88e236f4" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_ANTI_FRAUD_AUDIT_ENTITY_ID" ON "anti_fraud_audit" ("entity_id")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_ANTI_FRAUD_AUDIT_TIMESTAMP" ON "anti_fraud_audit" ("timestamp")
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP INDEX "public"."IDX_ANTI_FRAUD_AUDIT_TIMESTAMP"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_ANTI_FRAUD_AUDIT_ENTITY_ID"
        `);
        await queryRunner.query(`
            DROP TABLE "anti_fraud_audit"
        `);
    }

}
