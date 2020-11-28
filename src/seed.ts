import {getRepository} from "typeorm";
import {Role} from "./entity/Role";

export async function roles(...roles: string[]) {
    const repo = getRepository(Role);

    for (const role of roles) {
        let existing = await repo.findOne({name: role});

        if (!existing) {
            existing = new Role();
            existing.name = role;
            await repo.save(existing);
        }
    }
}