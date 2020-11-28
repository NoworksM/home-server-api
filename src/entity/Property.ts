import {Column, Entity, OneToMany, PrimaryGeneratedColumn} from "typeorm";
import Room from "./Room";
import UserProperty from "./UserProperty";

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
}

export default Property;