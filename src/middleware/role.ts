import {Context, Next} from "koa";
import {User} from "../entity/User";
import ErrorResponseViewModel from "../models/ErrorResponseViewModel";

function role(...roles: string[]): (ctx: Context, next: Next) => Promise<void> {
    return async (ctx, next): Promise<void> => {
        if (ctx.request.method === "OPTIONS") {
            await next();
            return;
        }

        const user: User | undefined | null = ctx.state.user;

        if (!user) {
            ctx.status = 401;
            ctx.body = new ErrorResponseViewModel("User must be logged in");
            return;
        }

        let userHasRole = false;

        for (const roleName of roles) {
            for (const role of user.roles) {
                if (role.name === roleName) {
                    userHasRole = true;
                    break;
                }
            }
        }

        if (!userHasRole) {
            ctx.status = 403;
            ctx.body = new ErrorResponseViewModel("User does not have permission to do that");
            return;
        }

        await next();
    };
}

export default role;