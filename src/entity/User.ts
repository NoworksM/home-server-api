import {Column, Entity, Index, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn} from 'typeorm';
import {IsEmail, Length} from "class-validator";
import {Role} from "./Role";
import UserProperty from "./UserProperty";
import * as bcrypt from "../util/bcrypt";
import config from "../config";

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

    @OneToMany(() => UserProperty, userProperty => userProperty.user)
    userProperties: UserProperty[];

    async updatePassword(password: string) {
        this.passwordHash = await bcrypt.hash(password, config.security.hashRounds);
    }
}

export interface UserProps {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    roles: string[];
}