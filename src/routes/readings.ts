import Router from "koa-router";
import validateViewModel from "../models/validateViewModel";
import CreateReadingViewModel from "../models/sensor/CreateReadingViewModel";
import ErrorResponseViewModel from "../models/ErrorResponseViewModel";
import {getRepository} from "typeorm";
import ReadingType from "../entity/ReadingType";
import Reading from "../entity/Reading";
import IAppContext from "../IAppContext";
import IAppState from "../IAppState";
import moment from "moment";
import omit from "lodash/omit";
import find from "lodash/find";
import LatestReading from "../entity/LatestReading";

const router = new Router<IAppState, IAppContext>({prefix: "/readings"});

router.post("/", async (ctx: IAppContext) => {
    const vm = await validateViewModel(ctx.request.body, CreateReadingViewModel);

    if (vm instanceof ErrorResponseViewModel) {
        ctx.status = 400;
        ctx.body = vm;
        return;
    }

    const readingsTypeRepo = getRepository(ReadingType);

    const readingType = await readingsTypeRepo.findOne({value: vm.type});

    if (!readingType) {
        ctx.status = 400;
        ctx.body = new ErrorResponseViewModel(`Reading type ${vm.type} does not exist`);
        return;
    }

    const now = moment();

    const currentSensorLocation = find(ctx.state.sensor?.locations, (l) => moment(l.start).isSameOrBefore(now) && (!l.end || moment(l.end).isAfter(now)));

    if (!currentSensorLocation) {
        ctx.status = 400;
        ctx.body = new ErrorResponseViewModel("Sensor currently isn't assigned to a location");
        return;
    }

    const readingsRepo = getRepository(Reading);
    const latestReadingRepo = getRepository(LatestReading);

    let reading = new Reading();
    reading.recordedAt = now.toDate();
    reading.room = currentSensorLocation.room;
    reading.readingType = readingType;
    reading.value = vm.value;

    reading = await readingsRepo.save(reading);

    let latestReading = await latestReadingRepo.findOne({room: currentSensorLocation.room, readingType});

    if (!latestReading || latestReading.recordedAt < now.toDate()) {
        latestReading = new LatestReading();
        latestReading.recordedAt = now.toDate();
        latestReading.room = currentSensorLocation.room;
        latestReading.readingType = readingType;
        latestReading.value = vm.value;

        await latestReadingRepo.save(latestReading);
    }

    ctx.body = omit(reading, ["sensor", "room"]);
});

export default router;