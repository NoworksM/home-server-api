import {Column, Entity, Index, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import Sensor from "./Sensor";
import Room from "./Room";
import ReadingType from "./ReadingType";

@Entity()
@Index(["roomId", "readingTypeId", "sensorId", "recordedAt"], {unique: true})
class Reading {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({nullable: false})
    recordedAt: Date;

    @Column()
    readingTypeId: string;

    @ManyToOne(() => ReadingType, readingType => readingType.readings)
    readingType: ReadingType;

    @Column()
    roomId: string;

    @ManyToOne(() => Room, room => room.readings)
    room: Room;

    @Column()
    sensorId: string;

    @ManyToOne(() => Sensor, sensor => sensor.readings)
    sensor: Sensor;

    @Column({type: "float"})
    value: number;
}

export default Reading;