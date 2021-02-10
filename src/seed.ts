import {getRepository} from "typeorm";
import {Role} from "./entity/Role";
import ReadingType from "./entity/ReadingType";
import {User, UserProps} from "./entity/User";
import Property, {PropertyProps} from "./entity/Property";
import UserProperty from "./entity/UserProperty";
import Room from "./entity/Room";
import Sensor from "./entity/Sensor";
import SensorLocation from "./entity/SensorLocation";
import moment from "moment";

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

export async function users(...users: UserProps[]) {
    const repo = getRepository(User);
    const roleRepo = getRepository(Role);

    for (let u of users) {
        let existing = await repo.findOne({email: u.email});

        if (!existing) {
            existing = new User();
            existing.email = u.email;
            existing.firstName = u.firstName;
            existing.lastName = u.lastName;
            await existing.updatePassword(u.password);

            for (let r in u.roles) {
                let er = await roleRepo.findOne({name: r});

                if (er) {
                    existing.roles.push(er);
                }
            }

            await repo.save(existing);
        }
    }
}

export async function properties(...properties: PropertyProps[]) {
    const repo = getRepository(Property);
    const userRepo = getRepository(User);
    const roleRepo = getRepository(Role);
    const userPropertyRepo = getRepository(UserProperty);
    const roomRepo = getRepository(Room);
    const sensorRepo = getRepository(Sensor);
    const sensorLocationRepo = getRepository(SensorLocation);

    const now = moment();

    for (let p of properties) {
        let existing = await repo.findOne({name: p.name});

        if (!existing) {
            existing = new Property();
            existing.name = p.name;

            await repo.save(existing);

            for (let up of p.users) {
                const user = await userRepo.findOne({email: up.email});
                const role = await roleRepo.findOne({name: up.role});

                if (user && role) {
                    const userProperty = new UserProperty();
                    userProperty.role = role;
                    userProperty.user = user;
                    userProperty.property = existing;

                    await userPropertyRepo.save(userProperty);
                }
            }

            for (let r of p.rooms) {
                const room = new Room();
                room.name = r.name;
                room.property = existing;

                await roomRepo.save(room);

                for (let s of r.sensors) {
                    const sensor = new Sensor();
                    sensor.name = s.name;
                    await sensor.updateSecret(s.secret);

                    await sensorRepo.save(sensor);

                    const sensorLocation = new SensorLocation();
                    sensorLocation.room = room;
                    sensorLocation.sensor = sensor;
                    sensorLocation.start = now.toDate();

                    await sensorLocationRepo.save(sensorLocation);
                }

            }

            await repo.save(existing);
        }
    }
}