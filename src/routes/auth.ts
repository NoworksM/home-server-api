import Router from 'koa-router';
import {ExtendableContext} from "koa";
import LoginViewModel from "../models/auth/LoginViewModel";
import assign from 'lodash/assign';
import {validate} from "class-validator";
import {getRepository} from "typeorm";
import {User} from "../entity/User";
import ErrorResponseViewModel from "../models/ErrorResponseViewModel";
import {compare} from "../util/bcrypt";
import jwt from 'jsonwebtoken';
import config from "../config";


const router = new Router({prefix: '/auth'});

router.post('/', async (ctx: ExtendableContext) => {
    const vm = new LoginViewModel();
    assign(vm, ctx.request.body);

    const errors = await validate(vm);

    if (errors.length > 0) {
        ctx.body = new ErrorResponseViewModel('Invalid data', errors);
        return;
    }

    const userRepo = getRepository(User);
    const user = await userRepo.findOne({email: vm.email});

    if (!user) {
        ctx.response.status = 400;
        ctx.body = new ErrorResponseViewModel('Credentials did not match');
        return;
    }

    const result = await compare(vm.password, user.passwordHash);

    if (!result) {
        ctx.body = new ErrorResponseViewModel('Credentials did not match');
        return;
    }

    const token = jwt.sign({userId: user.id}, config.security.jwtSecret);

    ctx.body = {token};
});

export default router;