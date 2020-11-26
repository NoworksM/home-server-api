import {IsEmail, Length} from "class-validator";

export default class CreateUserViewModel {
    @IsEmail()
    email: string;
    @Length(3, 64)
    firstName: string;
    @Length(3, 64)
    lastName: string;
    @Length(8)
    password: string;
}