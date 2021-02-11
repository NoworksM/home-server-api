import {EntityRepository, Repository} from "typeorm";
import Room from "../Room";
import _ from "lodash";

@EntityRepository(Room)
export default class RoomRepository extends Repository<Room> {
    async getDistinctReadingTypesForRooms(roomIds: string[]): Promise<{roomId: string, readingTypeIds: string[]}[]> {
        const readingTypesForRoom = await this.createQueryBuilder("room")
            .leftJoin("room.readings", "reading")
            .select("room.id", "roomId")
            .select("reading.readingTypeId", "readingTypeId")
            .distinctOn(["room.id", "reading.readingTypeId"])
            .where("room.id IN (:...roomIds)", {roomIds})
            .orderBy("room.id")
            .addOrderBy("reading.readingTypeId")
            .getRawMany();

        return _(readingTypesForRoom)
            .groupBy("roomId")
            .map((v, k) => {return {roomId: k, readingTypeIds: _.flatMap(v, "readingTypeId")}})
            .value();
    }
}