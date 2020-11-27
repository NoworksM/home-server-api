import Router, {IRouterOptions} from "koa-router";
import validateViewModel from "../models/validateViewModel";
import ErrorResponseViewModel from "../models/ErrorResponseViewModel";
import {getRepository, Repository} from "typeorm";
import defaults from "lodash/defaults";
import assign from "lodash/assign";
import {ExtendableContext} from "koa";
import get = Reflect.get;

interface ICrudRouterOptions extends IRouterOptions {
    getAll?: boolean;
    getById?: boolean;
    post?: boolean;
    put?: boolean;
    delete?: boolean;
    isSoftDelete?: boolean;
    softDeleteColumn?: string;
    getAllPath?: string;
    getByIdPath?: string;
    putPath?: string;
    postPath?: string;
    deletePath?: string;
    idColumn?: string;
    /**
     * Parameters to omit when returning to user
     */
    paramsToOmit?: string[];
}

interface ICrudRouterForcedOptions extends IRouterOptions {
    getAll?: boolean;
    getById?: boolean;
    post?: boolean;
    put?: boolean;
    delete?: boolean;
    isSoftDelete: boolean;
    softDeleteColumn: string;
    getAllPath: string;
    getByIdPath: string;
    putPath: string;
    postPath: string;
    deletePath: string;
    idColumn: string;
    /**
     * Parameters to omit when returning to user
     */
    paramsToOmit?: string[];
}

async function getModelAndRepoOrSetResponse<TEntity>(ctx: ExtendableContext, entityConstructor: { new(): TEntity }, options: ICrudRouterOptions): Promise<{ model?: TEntity, repository?: Repository<TEntity> }> {
    const repository = getRepository(entityConstructor);

    const findOptions: { [key: string]: any } = {};

    // @ts-ignore
    findOptions[options.idColumn] = ctx.params.id;

    const model = await repository.findOne(findOptions);

    if (!model) {
        ctx.response.status = 404;
        return {};
    }

    return {model, repository};
}

const defaultOptions: ICrudRouterForcedOptions = {
    getAll: true,
    getById: true,
    put: true,
    post: true,
    delete: true,
    isSoftDelete: false,
    softDeleteColumn: "deleted",
    getAllPath: "/",
    getByIdPath: "/:id",
    putPath: "/:id",
    postPath: "/:id",
    deletePath: "/:id",
    idColumn: "id",
    paramsToOmit: []
};

function buildCrudRouter<TEntity>(entityConstructor: { new(): TEntity }, opts: ICrudRouterOptions) {
    const router = new Router(opts);

    const options: ICrudRouterForcedOptions = defaults(opts, defaultOptions);

    if (!options) {
        throw "Options must exist";
    }

    if (options.getAll) {
        router.get(options.getAllPath, async (ctx) => {
            const repository = getRepository(entityConstructor);

            const findOptions: any = {};

            if (options.isSoftDelete) {
                findOptions[options.softDeleteColumn] = false;
            }

            ctx.body = repository.find(findOptions);
        });
    }

    if (options.getById) {
        router.get(options.getByIdPath, async (ctx) => {
            const {model, repository} = await getModelAndRepoOrSetResponse(ctx, entityConstructor, options);

            if (!model || !repository) {
                return;
            }

            if (options.isSoftDelete && get(<any>model, options.softDeleteColumn)) {
                ctx.response.status = 404;
            } else {
                ctx.body = model;
            }
        });
    }

    if (options.post) {
        router.post(options.postPath, async (ctx) => {
            const vm = await validateViewModel(ctx.request.body, entityConstructor);

            if (vm instanceof ErrorResponseViewModel) {
                ctx.response.status = 400;
                ctx.body = vm;
                return;
            }

            const repo = getRepository(entityConstructor);
            try {
                ctx.body = await repo.save(vm);
            } catch {
                ctx.response.status = 500;
                ctx.body = new ErrorResponseViewModel("An error occurred while saving the data");
            }
        });
    }

    if (options.put) {
        router.put(options.putPath, async (ctx) => {
            const vm = await validateViewModel(ctx.request.body, entityConstructor);

            if (vm instanceof ErrorResponseViewModel) {
                ctx.response.status = 400;
                ctx.body = vm;
                return;
            }

            const {model, repository} = await getModelAndRepoOrSetResponse(ctx, entityConstructor, options);

            if (!model || !repository) {
                return;
            }

            if (options.isSoftDelete && get(<any>model, options.softDeleteColumn)) {
                ctx.response.status = 404;
            } else {
                assign(model, vm);

                try {
                    ctx.body = await repository.save(model);
                } catch {
                    ctx.response.status = 500;
                    ctx.body = new ErrorResponseViewModel("An unknown error occurred while saving data");
                    return;
                }
            }
        });
    }

    if (options.delete) {
        router.del(options.deletePath, async (ctx) => {
            const {model, repository} = await getModelAndRepoOrSetResponse(ctx, entityConstructor, options);

            if (!model || !repository) {
                return;
            }

            if (options.isSoftDelete) {
                const assignment: any = {};
                assignment[options.softDeleteColumn] = true;
                assign(<any>model, assignment);

                try {
                    await repository.save(model);
                    ctx.response.status = 204;
                } catch {
                    ctx.response.status = 500;
                    ctx.body = new ErrorResponseViewModel("An error occurred when deleting data");
                }
            } else {
                try {
                    await repository.delete(model);
                    ctx.response.status = 204;
                } catch {
                    ctx.response.status = 500;
                    ctx.body = new ErrorResponseViewModel("An error occurred when deleting data");
                }
            }
        });
    }

    return router;
}

export default buildCrudRouter;