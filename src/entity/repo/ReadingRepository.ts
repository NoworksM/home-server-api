import {EntityRepository, Repository} from "typeorm";
import Reading from "../Reading";

@EntityRepository(Reading)
export default class ReadingRepository extends Repository<Reading> {
    async getLatestReadingForRoomAndType(roomId: string, readingTypeId: string) {
        return await this.createQueryBuilder("reading")
            .where("reading.roomId = :roomId AND reading.readingTypeId = :readingTypeId", {roomId, readingTypeId})
            .orderBy("reading.recordedAt", "DESC")
            .getOne();
    }
}