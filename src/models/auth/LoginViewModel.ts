import {IsEmail, Length} from "class-validator";

export default class LoginViewModel {
    @IsEmail()
    email: string;

    @Length(3)
    password: string;
}