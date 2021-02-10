import {Connection, createConnection, getRepository} from "typeorm";
import {Role} from "./entity/Role";
import config from "./config";
import testOrmConfig from "../testOrmConfig";
import * as seed from "./seed";
import ReadingType from "./entity/ReadingType";

let connection: Connection;

beforeAll(async () => {
    // @ts-ignore
    connection = await createConnection(testOrmConfig);
});

afterAll(async () => {
   await connection.close();
});

it("should have all roles in the config created", async (done) => {
    await seed.roles(...config.seed.roles);

    const repo = await getRepository(Role);

    for (const role of config.seed.roles) {
        const existing = await repo.findOne({name: role});

        expect(existing).toHaveProperty("name");
        // @ts-ignore
        expect(existing.name).toBe(role);
    }

    done();
});

it("should have all reading types in the config created", async (done) => {
    await seed.readingTypes(...config.seed.readingTypes);

    const repo = await getRepository(ReadingType);

    for (const readingType of config.seed.readingTypes) {
        const existing = await repo.findOne({value: readingType});

        expect(existing).toHaveProperty("value");
        // @ts-ignore
        expect(existing.value).toBe(readingType);
    }

    done();
});