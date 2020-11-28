import {Context, Next} from "koa";
import ITokenPayload from "../models/ITokenPayload";
import ErrorResponseViewModel from "../models/ErrorResponseViewModel";
import cache from "../cache/SiteMemoryCache";
import only from "./only";
import except from "./except";

async function userMiddleware(ctx: Context, next: Next): Promise<void> {
    if (ctx.request.method === "OPTIONS") {
        await next();
        return;
    }

    const token: ITokenPayload | undefined = ctx.state.user;

    if (!token || !token.userId) {
        ctx.status = 401;
        ctx.body = new ErrorResponseViewModel("User not signed in");
        return;
    }

    ctx.state.token = token;

    const user = await cache.getUser(token.userId, true);

    if (user) {
        ctx.state.user = user;
        await next();
    } else {
        ctx.status = 401;
        ctx.body = new ErrorResponseViewModel("User not signed in");
    }
}

userMiddleware.only = only(userMiddleware);

userMiddleware.except = except(userMiddleware);

export default userMiddleware;