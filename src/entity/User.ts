import {Entity, PrimaryGeneratedColumn, Column, Index, ManyToMany, JoinTable, ManyToOne} from 'typeorm';
import {IsEmail, Length} from "class-validator";
import {Role} from "./Role";
import UserProperty from "./UserProperty";

@Entity()
export class User {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    @Length(3, 64)
    firstName: string;

    @Column()
    @Length(3, 64)
    lastName: string;

    @Column()
    @Index({unique: true})
    @IsEmail()
    email: string;

    @Column()
    passwordHash: string;

    @ManyToMany(() => Role, role => role.users, {eager: true})
    @JoinTable()
    roles: Role[];

    @ManyToOne(() => UserProperty, userProperty => userProperty.user)
    userProperties: UserProperty[];
}