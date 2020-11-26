import Router from 'koa-router';
import assign from 'lodash/assign';
import {validate} from "class-validator";
import {getRepository} from "typeorm";
import {User} from "../entity/User";
import ErrorResponseViewModel from "../models/ErrorResponseViewModel";
import {hash} from "../util/bcrypt";
import CreateUserViewModel from "../models/auth/CreateUserViewModel";
import omit from "lodash/omit";
import role from "../middleware/role";
import config from "../config";


const router = new Router({prefix: '/users'});

router.use(["/create"], role("admin"));

router.post('/create', async (ctx) => {
    const vm = new CreateUserViewModel();
    assign(vm, ctx.request.body);

    const errors = await validate(vm);

    if (errors.length > 0) {
        ctx.body = new ErrorResponseViewModel('Invalid data', errors);
        return;
    }

    const userRepo = getRepository(User);

    const existing = await userRepo.findOne({email: vm.email});

    if (existing) {
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
    const user: User = ctx.state.user;

    if (user === null) {
        ctx.status = 404;
        ctx.body = new ErrorResponseViewModel("Not found");
        return;
    }

    ctx.body = {
        user: omit(user, [
            "id",
            "roles",
            "passwordHash"
        ])
    };
});

export default router;