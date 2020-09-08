import {parse as parseInner} from "./parse"
import { Expression } from "../types"
import { finalize } from "./finalize";

export const parse = (text:string) : Expression => {
    const unfinalized = parseInner(text);
    return finalize(unfinalized);
}