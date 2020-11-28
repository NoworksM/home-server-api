import {DefaultState} from "koa";
import {User} from "./entity/User";
import Sensor from "./entity/Sensor";

interface IAppState extends DefaultState {
    user?: User;
    sensor?: Sensor;
}

export default IAppState;