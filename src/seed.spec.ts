import initialize from "./server";
import {getRepository} from "typeorm";
import {Role} from "./entity/Role";
import config from "./config";
import testOrmConfig from "../testOrmConfig";

beforeAll(async () => {
    await initialize(testOrmConfig);
});

it("should have all roles in the config created", async (done) => {
    const repo = await getRepository(Role);

    for (const role of config.seed.roles) {
        const existing = await repo.findOne({name: role});

        expect(existing).toHaveProperty("name");
        // @ts-ignore
        expect(existing.name).toBe(role);
    }

    done();
});