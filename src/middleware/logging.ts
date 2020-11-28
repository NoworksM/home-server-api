import {Next} from "koa";
import IAppContext from "../IAppContext";

async function loggerMiddleware(ctx: IAppContext, next: Next) {
    await next();

    let level: string;
    if (ctx.response.status >= 400 && ctx.response.status < 600) {
        level = "warn";
    } else {
        level = "debug";
    }

    ctx.logger.log(level, `${ctx.response.status} ${ctx.request.method} ${ctx.request.path}`);
}

export default loggerMiddleware;