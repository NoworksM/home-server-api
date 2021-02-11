import Koa, {Middleware, Next} from 'koa';
import jwt from 'koa-jwt';
import {createConnection} from "typeorm";
import authRouter from './routes/auth';
import userRouter from './routes/users';
import readingsRouter from "./routes/readings";
import propertiesRouter from "./routes/properties";
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
import {Server} from "http";
import * as seed from "./seed";

let server: Server | null = null;

function initialize(ormConfig?: any): Promise<Server> {
    return new Promise((resolve) => {
        if (server) {
            resolve(server);
        }

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        // noinspection JSUnusedLocalSymbols
        createConnection(ormConfig).then(async conn => {
            const app: Koa<IAppState, IAppContext> = new Koa();

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

            _use(cors({origin: config.server.clientAddress}));
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

            _use(userMiddleware.except(/\/auth\/?/, {path: /\/readings\/?$/, method: "POST"}));
            _use(sensorMiddleware.only({path: /\/readings\/?$/, method: "POST"}));

            _use(authRouter.routes());
            _use(authRouter.allowedMethods());
            _use(userRouter.routes());
            _use(userRouter.allowedMethods());
            _use(readingsRouter.routes());
            _use(readingsRouter.allowedMethods());
            _use(propertiesRouter.routes());
            _use(propertiesRouter.allowedMethods());

            _use(async (ctx) => {
                ctx.response.status = 404;
            });

            await seed.roles(...config.seed.roles);
            await seed.readingTypes(...config.seed.readingTypes);
            await seed.users(...config.seed.users);
            await seed.properties(...config.seed.properties);

            server = app.listen(config.server.port);

            resolve(server);
        });
    });
}

export default initialize;