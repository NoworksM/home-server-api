import {IsAscii, IsUUID} from "class-validator";

class SensorAuthViewModel {
    @IsUUID()
    sensorId: string;
    @IsAscii()
    secret: string;
}

export default SensorAuthViewModel;