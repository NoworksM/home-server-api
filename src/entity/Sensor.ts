import {Column, Entity, Index, OneToMany, PrimaryGeneratedColumn} from "typeorm";
import {Length} from "class-validator";
import Reading from "./Reading";
import SensorLocation from "./SensorLocation";

@Entity()
class Sensor {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    @Index({unique: true})
    @Length(3, 128)
    name: string;

    @Column()
    secretHash: string;

    @OneToMany(() => SensorLocation, sensorLocation => sensorLocation.sensor)
    locations: SensorLocation[];

    @OneToMany(() => Reading, reading => reading.sensor)
    readings: Reading[];
}

export default Sensor;