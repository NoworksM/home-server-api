import {Column, Entity, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import Sensor from "./Sensor";
import Room from "./Room";

@Entity()
class SensorLocation {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({nullable: false})
    start: Date;

    @Column({nullable: true})
    end: Date;

    @ManyToOne(() => Room, room => room.sensorLocations)
    room: Room;

    @ManyToOne(() => Sensor, sensor => sensor.locations)
    sensor: Sensor;
}

export default SensorLocation;