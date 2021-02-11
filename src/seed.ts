import {Between, getConnection, getCustomRepository, getRepository} from "typeorm";
import {Role} from "./entity/Role";
import ReadingType from "./entity/ReadingType";
import {User, UserProps} from "./entity/User";
import Property, {PropertyProps} from "./entity/Property";
import UserProperty from "./entity/UserProperty";
import Room from "./entity/Room";
import Sensor from "./entity/Sensor";
import SensorLocation from "./entity/SensorLocation";
import moment from "moment";
import PropertyRepository from "./entity/repo/PropertyRepository";
import Reading from "./entity/Reading";
import _ from "lodash";
import LatestReading from "./entity/LatestReading";

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

interface ReadingSeedProps {
    start: string;
    end: string;
    readingType: string;
    property: string;
    room: string;
    sensor: string;
    frequencyInSeconds: number;
    dataCenter: number;
    oscilations: number | undefined;
    deviation: number;
    amplitude: number;
}

export async function readings(...readingSeeds: ReadingSeedProps[]) {
    if (readingSeeds.length === 0) {
        return;
    }

    console.log(`Starting generation of reading seeds for `)

    const propertyRepository = getCustomRepository(PropertyRepository);
    const latestReadingRepository = getRepository(LatestReading);
    const readingTypeRepository = getRepository(ReadingType);
    const readingRepository = getRepository(Reading);
    const connection = getConnection();

    const now = new Date();

    for (let rs of readingSeeds) {
        const property = await propertyRepository.createQueryBuilder("property")
            .innerJoinAndSelect("property.rooms", "room")
            .innerJoinAndSelect("room.sensorLocations", "sensorLocation")
            .innerJoinAndSelect("sensorLocation.sensor", "sensor")
            .where("property.name = :name", {name: rs.property})
            .getOne();

        if (!property) {
            console.error(`Could not find property ${rs.property} while seeding readings`);
            continue;
        }

        const room = _.find(property.rooms, {name: rs.room});

        if (!room) {
            console.error(`Could not find room ${rs.room} for property ${rs.property} while seeding readings`);
            continue;
        }

        const sensor = _.find(room.sensorLocations, (sl) => sl.start <= now && (!sl.end || sl.end > now) && sl.sensor.name === rs.sensor)?.sensor;

        if (!sensor) {
            console.error(`Could not find sensor ${rs.sensor} for property ${rs.property} and room ${rs.room}  while seeding readings`);
            continue;
        }

        const readingType = await readingTypeRepository.findOne({value: rs.readingType});

        if (!readingType) {
            console.error(`Could not find reading type ${rs.readingType}`);
            continue;
        }

        const start = moment(rs.start, moment.ISO_8601);
        const end = moment(rs.end, moment.ISO_8601);

        const existingReadingCount = await readingRepository.count({
            roomId: room.id,
            sensorId: sensor.id,
            readingTypeId: readingType.id,
            recordedAt: Between(start.toISOString(), end.toISOString())
        });

        if (existingReadingCount > 0) {
            continue;
        }

        let latestReading: LatestReading|undefined = await latestReadingRepository.findOne({roomId: room.id, readingTypeId: readingType.id, sensorId: sensor.id});

        if (!latestReading) {
            latestReading = new LatestReading();
        }

        let valuesToInsert: {roomId: string, sensorId: string, readingTypeId: string, value: number, recordedAt: Date}[] = [];

        const oscilations = _.defaultTo(rs.oscilations, Math.abs(end.diff(start, "seconds")));

        const batchSize = 500;

        const executeBatchInsertAndClearPendingValues = async () => {
            await getConnection()
                .createQueryBuilder()
                .insert()
                .into(Reading)
                .values(valuesToInsert)
                .execute();
            valuesToInsert = [];
        };

        for (let time = start.clone(), idx = 0; time.isSameOrBefore(end); time.add(rs.frequencyInSeconds, "seconds"), idx++) {
            const deviationAdjustment = Math.random() * (rs.deviation) - rs.deviation;

            const value = rs.amplitude * Math.sin(idx / oscilations * 2 * Math.PI) + deviationAdjustment + rs.dataCenter;

            valuesToInsert.push({
                roomId: room.id,
                sensorId: sensor.id,
                readingTypeId: readingType.id,
                value,
                recordedAt: time.toDate()
            });

            latestReading.roomId = room.id;
            latestReading.sensorId = sensor.id;
            latestReading.readingTypeId = readingType.id;
            latestReading.value = value;
            latestReading.recordedAt = time.toDate();

            if (valuesToInsert.length === batchSize) {
                await executeBatchInsertAndClearPendingValues();
            }
        }

        if (valuesToInsert.length > 0) {
            await executeBatchInsertAndClearPendingValues();
        }

        await latestReadingRepository.save(latestReading);
    }

    console.log("Finished seeding reading data");
}