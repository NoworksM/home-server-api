import Router from 'koa-router';
import LoginViewModel from "../models/auth/LoginViewModel";
import SensorAuthViewModel from "../models/auth/SensorAuthViewModel";
import {getRepository} from "typeorm";
import {User} from "../entity/User";
import ErrorResponseViewModel from "../models/ErrorResponseViewModel";
import * as bcrypt from "../util/bcrypt";
import jwt from 'jsonwebtoken';
import config from "../config";
import validateViewModel from "../models/validateViewModel";
import Sensor from "../entity/Sensor";
import IAppContext from "../IAppContext";
import IAppState from "../IAppState";


const router = new Router<IAppState, IAppContext>({prefix: '/auth'});

router.post('/', async (ctx: IAppContext) => {
    const vm = await validateViewModel(ctx.request.body, LoginViewModel);

    if (vm instanceof ErrorResponseViewModel) {
        ctx.status = 400;
        ctx.body = vm;
        return;
    }

    const userRepo = getRepository(User);
    const user = await userRepo.findOne({email: vm.email});

    if (!user) {
        ctx.response.status = 400;
        ctx.body = new ErrorResponseViewModel('Credentials did not match');
        return;
    }

    const result = await bcrypt.compare(vm.password, user.passwordHash);

    if (!result) {
        ctx.status = 400;
        ctx.body = new ErrorResponseViewModel('Credentials did not match');
        return;
    }

    const token = jwt.sign({userId: user.id}, config.security.jwtSecret);

    ctx.body = {token};
});

router.post("/sensor", async (ctx: IAppContext) => {
    const vm = await validateViewModel(ctx.request.body, SensorAuthViewModel);

    if (vm instanceof ErrorResponseViewModel) {
        ctx.status = 400;
        ctx.body = vm;
        return;
    }

    const sensorRepo = getRepository(Sensor);
    const sensor = await sensorRepo.findOne({id: vm.sensorId});

    if (!sensor) {
        ctx.response.status = 400;
        ctx.body = new ErrorResponseViewModel("Sensor credentials did not match");
        return;
    }

    const result = await bcrypt.compare(vm.secret, sensor.secretHash);

    if (!result) {
        ctx.response.status = 400;
        ctx.body = new ErrorResponseViewModel("Sensor credentials did not match");
        return;
    }

    const token = jwt.sign({sensorId: sensor.id}, config.security.jwtSecret);

    ctx.body = {token};
});

export default router;