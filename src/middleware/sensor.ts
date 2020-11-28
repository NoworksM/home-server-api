import {Context, Next} from "koa";
import ITokenPayload from "../models/ITokenPayload";
import ErrorResponseViewModel from "../models/ErrorResponseViewModel";
import cache from "../cache/SiteMemoryCache";

async function sensorMiddleware(ctx: Context, next: Next): Promise<void> {
    if (ctx.request.method === "OPTIONS") {
        await next();
        return;
    }

    if (!/^\/sensor\/?/.test(ctx.request.path) && !/^\/auth\/?/.test(ctx.request.path)) {
        const token: ITokenPayload | undefined = ctx.state.user;

        if (!token || !token.sensorId) {
            ctx.status = 401;
            ctx.body = new ErrorResponseViewModel("Sensor not authorized");
            return;
        }

        ctx.state.token = token;

        const sensor = await cache.getSensor(token.sensorId, true);

        if (sensor) {
            ctx.state.sensor = sensor;
            await next();
        } else {
            ctx.response.status = 401;
            ctx.state.sensor = null;
        }
    } else {
        await next();
    }
}

export default sensorMiddleware;