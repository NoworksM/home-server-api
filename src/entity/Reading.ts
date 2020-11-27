import {Column, Entity, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import Sensor from "./Sensor";
import Room from "./Room";
import ReadingType from "./ReadingType";

@Entity()
class Reading {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({nullable: false})
    recordedAt: Date;

    @ManyToOne(() => ReadingType, readingType => readingType.readings)
    readingType: ReadingType;

    @ManyToOne(() => Room, room => room.readings)
    room: Room;

    @ManyToOne(() => Sensor, sensor => sensor.readings)
    sensor: Sensor;
}

export default Reading;