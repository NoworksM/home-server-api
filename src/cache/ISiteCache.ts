import {User} from "../entity/User";
import Sensor from "../entity/Sensor";

interface ISiteCache {
    getUser(id: string, loadIfMiss?: boolean): Promise<User|null>;
    setUser(id: string, user: User|undefined|null): void;
    refreshUser(id: string): Promise<User|null>;
    getSensor(id: string, loadIfMiss?: boolean): Promise<Sensor|null>;
    setSensor(id: string, sensor?: Sensor|undefined|null): void;
    refreshSensor(id: string): Promise<Sensor|null>;
}

export default ISiteCache;