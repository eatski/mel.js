import {parse as parseInner} from "./parse"
import { Expression } from "../types"
import { finalize } from "./finalize";

export class ParseError extends Error {
    constructor(err:Error,exp:string){
        super(`
        ${exp} 
        ${err}`
        )
        this._error = err;
    }
    public readonly _error : Error;
}

export const parse = (text:string) : Expression => {
    try {
        const unfinalized = parseInner(text);
        return finalize(unfinalized);
    } catch (e) {
        throw new ParseError(e,text)
    }
    
}