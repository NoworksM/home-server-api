import {IsNumber, Length} from "class-validator";

class CreateReadingViewModel {
    @Length(1)
    type: string;

    @IsNumber()
    value: number;
}

export default CreateReadingViewModel;