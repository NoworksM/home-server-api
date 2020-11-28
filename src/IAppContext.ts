import {ExtendableContext} from "koa";
import {Logger} from "winston";

interface IAppContext extends ExtendableContext {
    logger: Logger;
}

export default IAppContext;