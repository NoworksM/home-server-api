import {Context, Middleware, Next} from "koa";
import IPathSpec from "./IPathSpec";

function except(middleware: Middleware) {
    return function except(...routes: Array<string | RegExp | IPathSpec>) {
        return async (ctx: Context, next: Next) => {
            for (const route of routes) {
                if (typeof route === "string") {
                    if (route === ctx.request.path) {
                        await next();
                        return;
                    }
                } else if (route instanceof RegExp) {
                    if (route.test(ctx.request.path)) {
                        await next();
                        return;
                    }
                } else { // noinspection SuspiciousTypeOfGuard
                    if (typeof route === "object" && (typeof route.path === "string" || route.path instanceof RegExp) && typeof route.method === "string") {
                        const spec = <IPathSpec>route;

                        if (spec.method.toLowerCase() !== spec.method.toLowerCase()) {
                            continue;
                        }

                        if (typeof spec.path === "string" && spec.path === ctx.request.path) {
                            await next();
                            return;
                        }
                        if (spec.path instanceof RegExp && spec.path.test(ctx.request.path)) {
                            await next();
                            return;
                        }
                    }
                }
            }

            await middleware(ctx, next);
        };
    }
}

export default except;