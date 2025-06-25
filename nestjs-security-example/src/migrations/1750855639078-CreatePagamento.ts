import { MigrationInterface, QueryRunner } from "typeorm";

export class CreatePagamento1750855639078 implements MigrationInterface {
    name = 'CreatePagamento1750855639078'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "pagamento" (
                "id" SERIAL NOT NULL,
                "cpf" character varying NOT NULL,
                "valor" integer NOT NULL,
                CONSTRAINT "PK_ac81e75b741a26f350c5fb1ff20" PRIMARY KEY ("id")
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP TABLE "pagamento"
        `);
    }

}
