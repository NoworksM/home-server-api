import {IsAscii, IsUUID, Length} from "class-validator";

class SensorAuthViewModel {
    @IsUUID()
    sensorId: string;
    @IsAscii()
    @Length(3)
    secret: string;
}

export default SensorAuthViewModel;