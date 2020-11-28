import Koa, {Middleware, Next} from 'koa';
import jwt from 'koa-jwt';
import {createConnection} from "typeorm";
import authRouter from './routes/auth';
import userRouter from './routes/users';
import bodyParser from "koa-bodyparser";
import convert from "koa-convert";
import cors from "koa-cors";
import userMiddleware from "./middleware/user";
import config from "./config";
import sensorMiddleware from "./middleware/sensor";
import * as winston from "winston";
import {LoggerOptions} from "winston";
import EnvironmentType from "./EnvironmentType";
import IAppContext from "./IAppContext";
import IAppState from "./IAppState";
import loggerMiddleware from "./middleware/logging";

let app: Koa<IAppState, IAppContext>;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
// noinspection JSUnusedLocalSymbols
createConnection().then(async conn => {
    app = new Koa();

    const _use = (fn: Middleware<IAppState, IAppContext>) => {
        app.use(convert(fn));
    };

    const loggerOptions: LoggerOptions = {
        format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.label({label: "Request"}),
            winston.format.printf(({level, message, label, timestamp}) => `[${timestamp}][${label}][${level}] ${message}`)
        )
    };
    loggerOptions.transports = [];

    // noinspection JSUnreachableSwitchBranches
    switch (config.environment) {
        case EnvironmentType.Development:
            loggerOptions.level = "debug";
            loggerOptions.transports.push(new winston.transports.Console());
            break;
        case EnvironmentType.Staging:
            loggerOptions.level = "debug";
            loggerOptions.transports.push(new winston.transports.File({filename: "staging.log"}))
            break;
        case EnvironmentType.Production:
            loggerOptions.level = "warn";
            loggerOptions.transports.push(new winston.transports.File({filename: "production.log"}));
            break;
    }

    const logger = winston.createLogger(loggerOptions);

    _use(async (ctx: IAppContext, next: Next) => {
        ctx.logger = logger;
        await next();
    });

    _use(loggerMiddleware);

    _use(cors({origin: config.environment === EnvironmentType.Development ? "*" : config.server.clientAddress}));
    _use(bodyParser());

    _use(async (ctx: IAppContext, next: Next) => {
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
    _use(sensorMiddleware);

    _use(authRouter.routes());
    _use(authRouter.allowedMethods());
    _use(userRouter.routes());
    _use(userRouter.allowedMethods());

    _use(async (ctx) => {
        ctx.status = 404;
        ctx.body = null;
    });

    app.listen(config.server.port);
});