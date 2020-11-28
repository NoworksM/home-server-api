import {ExtendableContext} from "koa";
import {Logger} from "winston";
import IAppState from "./IAppState";

interface IAppContext extends ExtendableContext {
    logger: Logger;
    state: IAppState;
}

export default IAppContext;