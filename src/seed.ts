import {getRepository} from "typeorm";
import {Role} from "./entity/Role";
import ReadingType from "./entity/ReadingType";

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

export async function readingTypes(...readingTypes: string[]) {
    const repo = getRepository(ReadingType);

    for (const readingType of readingTypes) {
        let existing = await repo.findOne({value: readingType});

        if (!existing) {
            existing = new ReadingType();
            existing.value = readingType;
            await repo.save(existing);
        }
    }
}