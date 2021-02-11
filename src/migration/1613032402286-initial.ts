import {MigrationInterface, QueryRunner} from "typeorm";

export class initial1613032402286 implements MigrationInterface {
    name = 'initial1613032402286'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "role" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, CONSTRAINT "PK_b36bcfe02fc8de3c57a8b2391c2" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_ae4578dcaed5adff96595e6166" ON "role" ("name") `);
        await queryRunner.query(`CREATE TABLE "user" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "firstName" character varying NOT NULL, "lastName" character varying NOT NULL, "email" character varying NOT NULL, "passwordHash" character varying NOT NULL, CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_e12875dfb3b1d92d7d7c5377e2" ON "user" ("email") `);
        await queryRunner.query(`CREATE TABLE "user_property" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" uuid NOT NULL, "propertyId" uuid NOT NULL, "roleId" uuid, CONSTRAINT "PK_1634006cfbeda32628f970d34d1" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_256dd4523389261e6cb245c7f9" ON "user_property" ("userId", "propertyId") `);
        await queryRunner.query(`CREATE TABLE "property" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, CONSTRAINT "PK_d80743e6191258a5003d5843b4f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "sensor_location" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "start" TIMESTAMP NOT NULL, "end" TIMESTAMP, "roomId" uuid, "sensorId" uuid, CONSTRAINT "PK_d95a8832cfcfb048d702bcc2139" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "room" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "propertyId" uuid NOT NULL, CONSTRAINT "PK_c6d46db005d623e691b2fbcba23" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_7000232399c187f96560a5642d" ON "room" ("name", "propertyId") `);
        await queryRunner.query(`CREATE TABLE "reading_type" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "value" character varying NOT NULL, CONSTRAINT "PK_b06820278a6bf9f82ed2017a6a7" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_e2b976d44a550023db4b9877c4" ON "reading_type" ("value") `);
        await queryRunner.query(`CREATE TABLE "reading" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "recordedAt" TIMESTAMP NOT NULL, "readingTypeId" uuid NOT NULL, "roomId" uuid NOT NULL, "sensorId" uuid NOT NULL, "value" double precision NOT NULL, CONSTRAINT "PK_f46a902bd4c9624c8b512174944" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_83b636ac57809901fbebaa795c" ON "reading" ("roomId", "readingTypeId", "sensorId", "recordedAt") `);
        await queryRunner.query(`CREATE TABLE "sensor" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "secretHash" character varying NOT NULL, CONSTRAINT "PK_ccc38b9aa8b3e198b6503d5eee9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "latest_reading" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "recordedAt" TIMESTAMP NOT NULL, "readingTypeId" uuid NOT NULL, "roomId" uuid NOT NULL, "sensorId" uuid NOT NULL, "value" double precision NOT NULL, CONSTRAINT "PK_15691a40a3219a2a816f2a84a13" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_5ae970449c9706a8cf63fbb557" ON "latest_reading" ("roomId", "readingTypeId", "sensorId", "recordedAt") `);
        await queryRunner.query(`CREATE TABLE "user_roles_role" ("userId" uuid NOT NULL, "roleId" uuid NOT NULL, CONSTRAINT "PK_b47cd6c84ee205ac5a713718292" PRIMARY KEY ("userId", "roleId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_5f9286e6c25594c6b88c108db7" ON "user_roles_role" ("userId") `);
        await queryRunner.query(`CREATE INDEX "IDX_4be2f7adf862634f5f803d246b" ON "user_roles_role" ("roleId") `);
        await queryRunner.query(`ALTER TABLE "user_property" ADD CONSTRAINT "FK_8cb24d53924eaf3d02e38e43d7a" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_property" ADD CONSTRAINT "FK_fc567b505a70bec222461736237" FOREIGN KEY ("propertyId") REFERENCES "property"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_property" ADD CONSTRAINT "FK_e3b00e6226df6e7e67f32f3a515" FOREIGN KEY ("roleId") REFERENCES "role"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "sensor_location" ADD CONSTRAINT "FK_4508269d073f15905e8f8bd69c1" FOREIGN KEY ("roomId") REFERENCES "room"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "sensor_location" ADD CONSTRAINT "FK_65e7b90fb375eceb294beb9fde8" FOREIGN KEY ("sensorId") REFERENCES "sensor"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "room" ADD CONSTRAINT "FK_6a9adbe3db58dad30c0c63ca31d" FOREIGN KEY ("propertyId") REFERENCES "property"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "reading" ADD CONSTRAINT "FK_e0aebda9180b6ffdd5a8401bbe2" FOREIGN KEY ("readingTypeId") REFERENCES "reading_type"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "reading" ADD CONSTRAINT "FK_aa8a43941e34a3f65013adfad5c" FOREIGN KEY ("roomId") REFERENCES "room"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "reading" ADD CONSTRAINT "FK_103bcd8d7cf4f83b25f13b29a61" FOREIGN KEY ("sensorId") REFERENCES "sensor"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "latest_reading" ADD CONSTRAINT "FK_dd7fd277e56166774e46e5c60e1" FOREIGN KEY ("readingTypeId") REFERENCES "reading_type"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "latest_reading" ADD CONSTRAINT "FK_e36e36539524b04d1edff7dab95" FOREIGN KEY ("roomId") REFERENCES "room"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "latest_reading" ADD CONSTRAINT "FK_8f11db453802d066107015ee810" FOREIGN KEY ("sensorId") REFERENCES "sensor"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_roles_role" ADD CONSTRAINT "FK_5f9286e6c25594c6b88c108db77" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_roles_role" ADD CONSTRAINT "FK_4be2f7adf862634f5f803d246b8" FOREIGN KEY ("roleId") REFERENCES "role"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_roles_role" DROP CONSTRAINT "FK_4be2f7adf862634f5f803d246b8"`);
        await queryRunner.query(`ALTER TABLE "user_roles_role" DROP CONSTRAINT "FK_5f9286e6c25594c6b88c108db77"`);
        await queryRunner.query(`ALTER TABLE "latest_reading" DROP CONSTRAINT "FK_8f11db453802d066107015ee810"`);
        await queryRunner.query(`ALTER TABLE "latest_reading" DROP CONSTRAINT "FK_e36e36539524b04d1edff7dab95"`);
        await queryRunner.query(`ALTER TABLE "latest_reading" DROP CONSTRAINT "FK_dd7fd277e56166774e46e5c60e1"`);
        await queryRunner.query(`ALTER TABLE "reading" DROP CONSTRAINT "FK_103bcd8d7cf4f83b25f13b29a61"`);
        await queryRunner.query(`ALTER TABLE "reading" DROP CONSTRAINT "FK_aa8a43941e34a3f65013adfad5c"`);
        await queryRunner.query(`ALTER TABLE "reading" DROP CONSTRAINT "FK_e0aebda9180b6ffdd5a8401bbe2"`);
        await queryRunner.query(`ALTER TABLE "room" DROP CONSTRAINT "FK_6a9adbe3db58dad30c0c63ca31d"`);
        await queryRunner.query(`ALTER TABLE "sensor_location" DROP CONSTRAINT "FK_65e7b90fb375eceb294beb9fde8"`);
        await queryRunner.query(`ALTER TABLE "sensor_location" DROP CONSTRAINT "FK_4508269d073f15905e8f8bd69c1"`);
        await queryRunner.query(`ALTER TABLE "user_property" DROP CONSTRAINT "FK_e3b00e6226df6e7e67f32f3a515"`);
        await queryRunner.query(`ALTER TABLE "user_property" DROP CONSTRAINT "FK_fc567b505a70bec222461736237"`);
        await queryRunner.query(`ALTER TABLE "user_property" DROP CONSTRAINT "FK_8cb24d53924eaf3d02e38e43d7a"`);
        await queryRunner.query(`DROP INDEX "IDX_4be2f7adf862634f5f803d246b"`);
        await queryRunner.query(`DROP INDEX "IDX_5f9286e6c25594c6b88c108db7"`);
        await queryRunner.query(`DROP TABLE "user_roles_role"`);
        await queryRunner.query(`DROP INDEX "IDX_5ae970449c9706a8cf63fbb557"`);
        await queryRunner.query(`DROP TABLE "latest_reading"`);
        await queryRunner.query(`DROP TABLE "sensor"`);
        await queryRunner.query(`DROP INDEX "IDX_83b636ac57809901fbebaa795c"`);
        await queryRunner.query(`DROP TABLE "reading"`);
        await queryRunner.query(`DROP INDEX "IDX_e2b976d44a550023db4b9877c4"`);
        await queryRunner.query(`DROP TABLE "reading_type"`);
        await queryRunner.query(`DROP INDEX "IDX_7000232399c187f96560a5642d"`);
        await queryRunner.query(`DROP TABLE "room"`);
        await queryRunner.query(`DROP TABLE "sensor_location"`);
        await queryRunner.query(`DROP TABLE "property"`);
        await queryRunner.query(`DROP INDEX "IDX_256dd4523389261e6cb245c7f9"`);
        await queryRunner.query(`DROP TABLE "user_property"`);
        await queryRunner.query(`DROP INDEX "IDX_e12875dfb3b1d92d7d7c5377e2"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP INDEX "IDX_ae4578dcaed5adff96595e6166"`);
        await queryRunner.query(`DROP TABLE "role"`);
    }

}
