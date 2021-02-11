import LatestReading from "../LatestReading";
import {EntityRepository, Repository} from "typeorm";

@EntityRepository(LatestReading)
export default class LatestReadingRepository extends Repository<LatestReading> {
    async getForUserDashboard(userId: string, propertyIds: string[]) {
        return await this.createQueryBuilder("reading")
            .leftJoinAndSelect("reading.room", "room")
            .leftJoinAndSelect("room.property", "property")
            .leftJoinAndSelect("property.userProperties", "userProperty")
            .where("property.id in (:...propertyIds)", {propertyIds})
            .where("userProperty.userId = :userId", {userId})
            .printSql()
            .getMany();
    }

    async getForAdminDashboard() {
        return await this.createQueryBuilder("reading")
            .leftJoinAndSelect("reading.room", "room")
            .leftJoinAndSelect("room.property", "property")
            .getMany();
    }

    async getForUserPropertyDashboard(propertyId: string) {

    }
}