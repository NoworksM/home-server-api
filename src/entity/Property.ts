import {Column, Entity, OneToMany, PrimaryGeneratedColumn} from "typeorm";
import Room, {RoomProps} from "./Room";
import UserProperty, {UserPropertyProps} from "./UserProperty";
import Sensor from "./Sensor";

@Entity()
class Property {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    name: string;

    @OneToMany(() => Room, room => room.property, {cascade: true})
    rooms: Room[];

    @OneToMany(() => UserProperty, userProperty => userProperty.property, {onDelete: "CASCADE"})
    userProperties: UserProperty[];

    sensors: Sensor[];
}

interface PropertyProps {
    name: string;
    rooms: RoomProps[];
    users: UserPropertyProps[];
}

export {PropertyProps};

export default Property;