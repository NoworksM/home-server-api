import {Column, Entity, Index, ManyToMany, PrimaryGeneratedColumn} from "typeorm";
import {Length} from "class-validator";
import {User} from "./User";

@Entity()
export class Role {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    @Index({unique: true})
    @Length(3, 64)
    name: string;

    @ManyToMany(() => User, user => user.roles)
    users: User[];
}