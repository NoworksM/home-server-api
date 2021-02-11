import Router from "koa-router";
import IAppState from "../IAppState";
import IAppContext from "../IAppContext";
import {getCustomRepository} from "typeorm";
import PropertyRepository from "../entity/repo/PropertyRepository";
import RoomRepository from "../entity/repo/RoomRepository";
import ReadingRepository from "../entity/repo/ReadingRepository";
import _ from "lodash";
import PropertyState from "../models/properties/PropertyState";

const router = new Router<IAppState, IAppContext>({prefix: "/properties"});

router.get("/dashboard", async (ctx: IAppContext) => {
    if (typeof ctx.state.user !== "object") {
        throw new TypeError("ctx.state.user should have been an object");
    }

    const propertyRepo = getCustomRepository(PropertyRepository);

    const properties = await (_.some(ctx.state.user?.roles, (r) => r.name === "Admin") ? propertyRepo.getLatestReadingsForAdminDashboard() : propertyRepo.getLatestReadingsForUserDashboard(ctx.state.user.id));

    ctx.body = properties.map((p) => {

    });
});

router.get("/:id/dashboard", async (ctx: IAppContext) => {
    // TODO: Stub for individual property dashboards
});

export default router;