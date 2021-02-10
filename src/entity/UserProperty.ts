import {Column, Entity, Index, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import {User} from "./User";
import Property from "./Property";
import {Role} from "./Role";

@Entity()
@Index(["userId", "propertyId"], {unique: true})
class UserProperty {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    userId: string;

    @ManyToOne(() => User, user => user.userProperties)
    user: User;

    @Column()
    propertyId: string;

    @ManyToOne(() => Property, property => property.userProperties)
    property: Property;

    @ManyToOne(() => Role)
    role: Role;
}

interface UserPropertyProps {
    email: string;
    role: string;
}

export {UserProperty, UserPropertyProps};

export default UserProperty;