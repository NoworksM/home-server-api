import {Column, Entity, OneToMany, PrimaryGeneratedColumn} from "typeorm";
import {Length} from "class-validator";
import Reading from "./Reading";
import SensorLocation from "./SensorLocation";
import * as bcrypt from "../util/bcrypt";
import config from "../config";

@Entity()
class Sensor {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    @Length(3, 128)
    name: string;

    @Column()
    secretHash: string;

    @OneToMany(() => SensorLocation, sensorLocation => sensorLocation.sensor)
    locations: SensorLocation[];

    @OneToMany(() => Reading, reading => reading.sensor)
    readings: Reading[];

    async updateSecret(secret: string) {
        this.secretHash = await bcrypt.hash(secret, config.security.hashRounds);
    }
}

interface SensorProps {
    name: string;
    secret: string;
}

export {SensorProps};

export default Sensor;