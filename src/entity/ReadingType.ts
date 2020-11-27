import {Column, Entity, Index, OneToMany, PrimaryGeneratedColumn} from "typeorm";
import Reading from "./Reading";

@Entity()
class ReadingType {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    @Index({unique: true})
    value: string;

    @OneToMany(() => Reading, reading => reading.readingType)
    readings: Reading[];
}

export default ReadingType;