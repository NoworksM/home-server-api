import {ValidationError} from "class-validator";

export default class ErrorResponseViewModel {
    constructor(message: string, validationErrors: ValidationError[]|null = null) {
        this.message = message;
        this.validationErrors = validationErrors !== null ? validationErrors : [];
    }
    message: string;
    validationErrors: ValidationError[];
}