import {validate} from "class-validator";
import assign from "lodash/assign";
import ErrorResponseViewModel from "./ErrorResponseViewModel";

async function validateViewModel<TViewModel>(data: any, ctor: { new(): TViewModel }): Promise<TViewModel | ErrorResponseViewModel> {
    const vm= new ctor();
    assign(vm, data);

    const errors = await validate(vm);

    if (errors.length) {
        return new ErrorResponseViewModel("Invalid data", errors);
    }

    return vm;
}

export default validateViewModel;