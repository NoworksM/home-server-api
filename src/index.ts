import Koa, {ExtendableContext, Middleware, Next} from 'koa';
import jwt from 'koa-jwt';
import {createConnection} from "typeorm";
import authRouter from './routes/auth';
import userRouter from './routes/users';
import bodyParser from "koa-bodyparser";
import convert from "koa-convert";
import cors from "koa-cors";
import userMiddleware from "./middleware/user";
import config from "./config";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
// noinspection JSUnusedLocalSymbols
createConnection().then(async conn => {
    const app = new Koa();

    const _use = (fn: Middleware) => app.use(convert(fn));

    _use(cors({origin: config.server.clientAddress}));
    _use(bodyParser());

    _use(async (ctx: ExtendableContext, next: Next) => {
        try {
            await next();
        } catch (err) {
            if (err.status === 401) {
                ctx.status = 401;
                ctx.body = {
                    error: err.originalError ? err.originalError : err.message
                };
            } else {
                throw err;
            }
        }
    });

    _use(jwt({secret: config.security.jwtSecret, passthrough: true}).unless({path: [/^\/auth\/?/]}));

    _use(userMiddleware);

    _use(authRouter.routes());
    _use(authRouter.allowedMethods());
    _use(userRouter.routes());
    _use(userRouter.allowedMethods());

    app.listen(config.server.port);
});