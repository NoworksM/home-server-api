import Router from 'koa-router';
import {getRepository} from "typeorm";
import {User} from "../entity/User";
import ErrorResponseViewModel from "../models/ErrorResponseViewModel";
import {hash} from "../util/bcrypt";
import CreateUserViewModel from "../models/auth/CreateUserViewModel";
import omit from "lodash/omit";
import role from "../middleware/role";
import config from "../config";
import IAppState from "../IAppState";
import IAppContext from "../IAppContext";
import Roles from "../models/Roles";
import validateViewModel from "../models/validateViewModel";


const router = new Router<IAppState, IAppContext>({prefix: '/users'});

router.use(["/create"], role(Roles.Admin));

router.post('/create', async (ctx: IAppContext) => {
    const vm = await validateViewModel(ctx.request.body, CreateUserViewModel);

    if (vm instanceof ErrorResponseViewModel) {
        ctx.status = 400;
        ctx.body = vm;
        return;
    }

    const userRepo = getRepository(User);

    const existing = await userRepo.findOne({email: vm.email});

    if (existing) {
        ctx.status = 400;
        ctx.body = new ErrorResponseViewModel('User already exists');
        return;
    }

    let user = new User();
    try {
        user.email = vm.email;
        user.firstName = vm.firstName;
        user.lastName = vm.lastName;
        user.passwordHash = await hash(ctx.request.body.password, config.security.hashRounds);
        user = await userRepo.save(user);
    } catch (err) {
        ctx.body = new ErrorResponseViewModel(err);
        return;
    }

    ctx.body = user;
});

router.get("/me", async (ctx) => {
    const user = ctx.state.user;

    ctx.body = {
        user: omit(user, [
            "id",
            "roles",
            "passwordHash"
        ])
    };
});

export default router;