import {Context, Next} from "koa";
import ITokenPayload from "../models/ITokenPayload";
import ErrorResponseViewModel from "../models/ErrorResponseViewModel";
import cache from "../cache/SiteMemoryCache";

async function userMiddleware(ctx: Context, next: Next): Promise<void> {
    if (ctx.request.method === "OPTIONS") {
        await next();
        return;
    }

    if (!/^\/auth\/?/.test(ctx.request.path)) {
        const token: ITokenPayload | undefined = ctx.state.user;

        if (!token) {
            ctx.status = 401;
            ctx.body = new ErrorResponseViewModel("User not signed in");
            return;
        }

        ctx.state.token = token;

        const user = await cache.getUser(token.userId, true);

        if (user) {
            ctx.state.user = user;
        } else {
            ctx.state.user = null;
        }
    }

    await next();
}

export default userMiddleware;