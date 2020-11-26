import {User} from "../entity/User";

interface ISiteCache {
    getUser(id: string, loadIfMiss: boolean): Promise<User|null>;
    setUser(id: string, user: User|undefined|null): void;
    refreshUser(id: string): Promise<User|null>;
}

export default ISiteCache;