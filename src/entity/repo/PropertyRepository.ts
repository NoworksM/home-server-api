import Property from "../Property";
import {EntityRepository, Repository} from "typeorm";

@EntityRepository(Property)
export default class PropertyRepository extends Repository<Property> {
    async getWithRoomsForUser(userId: string) {
        return await this.createQueryBuilder("property")
            .innerJoin("property.userProperties", "userProperty", "userProperty.userId = :userId", {userId})
            .leftJoinAndSelect("property.rooms", "room")
            .getMany();
    }

    async getWithRoomsForAdmin() {
        return await this.createQueryBuilder("property")
            .leftJoinAndSelect("property.rooms", "room")
            .getMany();
    }

    async getLatestReadingsForUserDashboard(userId: string) {
        return await this.createQueryBuilder("property")
            .innerJoinAndSelect("property.userProperties", "userProperty", "userProperty.userId = :userId", {userId})
            .leftJoinAndSelect("property.rooms", "room")
            .leftJoinAndSelect("room.latestReadings", "reading")
            .leftJoinAndSelect("reading.readingType", "readingType")
            .orderBy("property.name")
            .printSql()
            .getMany();
    }

    async getLatestReadingsForAdminDashboard() {
        return await this.createQueryBuilder("property")
            .leftJoinAndSelect("property.rooms", "room")
            .leftJoinAndSelect("room.latestReadings", "reading")
            .leftJoinAndSelect("reading.readingType", "readingType")
            .orderBy("property.name")
            .printSql()
            .getMany();
    }

    async getLatestReadingsForUserPropertyDashboard(userId: string, propertyId: string) {
        return await this.createQueryBuilder("property")
            .innerJoin("property.userProperties", "userProperty", "userProperty.userId = :userId", {userId})
            .leftJoinAndSelect("property.rooms", "room")
            .leftJoinAndSelect("room.latestReadings", "reading")
            .leftJoinAndSelect("reading.readingType", "readingType")
            .where("property.id = :propertyId", {propertyId})
            .orderBy("property.name")
            .addOrderBy("room.name")
            .printSql()
            .getMany();
    }

    async getLatestReadingsForAdminPropertyDashboard(propertyId: string) {
        return await this.createQueryBuilder("property")
            .leftJoinAndSelect("property.rooms", "room")
            .leftJoinAndSelect("room.latestReadings", "reading")
            .leftJoinAndSelect("reading.readingType", "readingType")
            .where("property.id = :propertyId", {propertyId})
            .orderBy("property.name")
            .addOrderBy("room.name")
            .printSql()
            .getMany();
    }
}