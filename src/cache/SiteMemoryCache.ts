import NodeCache from "node-cache";
import {User} from "../entity/User";
import {getRepository} from "typeorm";
import ISiteCache from "./ISiteCache";

class SiteMemoryCache implements ISiteCache {
    private _cache: NodeCache;

    constructor() {
        this._cache = new NodeCache();
    }

    private static userKey(userId: string): string {
        return `user-${userId}`;
    }

    async getUser(id: string, loadIfMiss = true): Promise<User|null> {
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
}

// Export singleton to maintain a single cache object
export default <ISiteCache> new SiteMemoryCache();