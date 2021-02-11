import ReadingState from "./ReadingState";

export default interface RoomState {
    name: string;
    readings: ReadingState[];
}