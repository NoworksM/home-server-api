import {ExtendableContext, Next} from "koa";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import * as config from '../../../../config';

async function cors(ctx: ExtendableContext, next: Next): Promise<void> {
    ctx.set("Access-Control-Allow-Origin", config.server.clientAddress);
    ctx.set("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    ctx.set("Access-Control-Allow-Methods", "POST, GET, PUT, DELETE, OPTIONS");
    await next();
    ctx.set("Access-Control-Allow-Origin", config.server.clientAddress);
    ctx.set("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    ctx.set("Access-Control-Allow-Methods", "POST, GET, PUT, DELETE, OPTIONS");
}

export default cors;