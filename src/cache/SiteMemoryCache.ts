import NodeCache from "node-cache";
import {User} from "../entity/User";
import {getRepository} from "typeorm";
import ISiteCache from "./ISiteCache";
import Sensor from "../entity/Sensor";
import defaultTo from "lodash/defaultTo";

class SiteMemoryCache implements ISiteCache {
    private _cache: NodeCache;

    constructor() {
        this._cache = new NodeCache();
    }

    private static userKey(userId: string): string {
        return `user-${userId}`;
    }

    async getUser(id: string, loadIfMiss?: boolean): Promise<User|null> {
        loadIfMiss = defaultTo(loadIfMiss, true);

        let user: User|null|undefined = this._cache.get(SiteMemoryCache.userKey(id));

        if (!user && loadIfMiss) {
            user = await this.refreshUser(id);
        }

        return user ? <User> user : null;
    }

    setUser(id: string, user: User|undefined|null): void {
        const key = SiteMemoryCache.userKey(id);

        if (user) {
            this._cache.set(key, user);
        } else {
            this._cache.del(key);
        }
    }

    async refreshUser(id: string): Promise<User|null> {
        const user = await getRepository(User).findOne({id}, {relations: ["roles"]});

        this.setUser(id, user);

        return user ? <User> user : null;
    }

    private static sensorKey(sensorId: string): string {
        return `sensor-${sensorId}`;
    }

    async getSensor(id: string, loadIfMiss?: boolean): Promise<Sensor | null> {
        loadIfMiss = defaultTo(loadIfMiss, true);

        let sensor = this._cache.get(SiteMemoryCache.sensorKey(id));

        if (!sensor && loadIfMiss) {
            sensor = await this.refreshSensor(id);
        }

        return sensor ? <Sensor> sensor : null;
    }

    async refreshSensor(id: string): Promise<Sensor | null> {
        const sensor = await getRepository(Sensor).findOne({id}, {relations: ["locations", "locations.room"]});

        this.setSensor(id, sensor);

        return sensor ? <Sensor> sensor : null;
    }

    setSensor(id: string, sensor: Sensor|undefined|null): void {
        const key = SiteMemoryCache.sensorKey(id);

        if (sensor) {
            this._cache.set(key, sensor);
        } else {
            this._cache.del(key);
        }
    }
}

// Export singleton to maintain a single cache object
export default <ISiteCache> new SiteMemoryCache();