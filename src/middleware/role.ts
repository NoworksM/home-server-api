import {Context, Next} from "koa";
import {User} from "../entity/User";
import ErrorResponseViewModel from "../models/ErrorResponseViewModel";
import some from "lodash/some";

function role(...roles: string[]): (ctx: Context, next: Next) => Promise<void> {
    return async (ctx, next): Promise<void> => {
        if (ctx.request.method === "OPTIONS") {
            await next();
            return;
        }

        const user: User|undefined|null = ctx.state.user;

        if (!user) {
            ctx.status = 401;
            ctx.body = new ErrorResponseViewModel("User must be logged in");
            return;
        }

        if (!some(user.roles, (r) => roles.indexOf(r.name) !== -1)) {
            ctx.status = 403;
            ctx.body = new ErrorResponseViewModel("User does not have permission to do that");
            return;
        }

        await next();
    };
}

export default role;