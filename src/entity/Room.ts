import {Column, Entity, Index, ManyToOne, OneToMany, PrimaryGeneratedColumn} from "typeorm";
import Property from "./Property";
import Reading from "./Reading";
import SensorLocation from "./SensorLocation";

@Entity()
@Index(["name", "propertyId"], {unique: true})
class Room {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    name: string;

    @ManyToOne(() => SensorLocation, sensorLocation => sensorLocation.room)
    sensorLocations: SensorLocation[];

    @Column()
    propertyId: string;

    @ManyToOne(() => Property, property => property.rooms)
    property: Property;

    @OneToMany(() => Reading, reading => reading.room)
    readings: Reading[];
}

export default Room;