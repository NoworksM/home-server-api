import {Column, Entity, Index, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import Sensor from "./Sensor";
import Room from "./Room";
import ReadingType from "./ReadingType";

@Entity()
@Index(["roomId", "readingTypeId"], {unique: true})
@Index(["roomId", "readingTypeId", "recordedAt"])
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

    @ManyToOne(() => Sensor, sensor => sensor.readings)
    sensor: Sensor;

    @Column()
    value: number;
}

export default Reading;