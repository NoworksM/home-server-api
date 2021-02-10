import {Column, Entity, Index, ManyToOne, OneToMany, PrimaryGeneratedColumn} from "typeorm";
import Property from "./Property";
import Reading from "./Reading";
import SensorLocation from "./SensorLocation";
import {SensorProps} from "./Sensor";

@Entity()
@Index(["name", "propertyId"], {unique: true})
class Room {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    name: string;

    @OneToMany(() => SensorLocation, sensorLocation => sensorLocation.room, {onDelete: "CASCADE"})
    sensorLocations: SensorLocation[];

    @Column()
    propertyId: string;

    @ManyToOne(() => Property, property => property.rooms)
    property: Property;

    @OneToMany(() => Reading, reading => reading.room)
    readings: Reading[];
}

interface RoomProps {
    name: string;
    sensors: SensorProps[];
}

export {RoomProps};

export default Room;