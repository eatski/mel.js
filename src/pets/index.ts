import { asConst } from "./util";

export interface Parser<T> {
    consume(str:string):ParseResultInner<T>,
    parse(str:string):ParseResult<T>
    then<R>(action: (result:T) => R):Parser<R>,
    validate(predicate: (result:T) => boolean):Parser<T>
    onParsed(cb:(str:string,parsed:ParseResultInner<T>) => void):Parser<T>,
    not(parser:Parser<unknown>):Parser<T>
}
type Parsers<T> = { [P in keyof T]: Parser<T[P]> };
type ParseResultTypeSuccess = "match" 
type ParseResultTypeFailure = "failure" 
type ParseResultSuccess<T> = {result:ParseResultTypeSuccess,content:T}
type ParseResultSuccessInner<T> = {result:ParseResultTypeSuccess,content:T,unconsumed:string}
type ParseResultFailure = {result:ParseResultTypeFailure}

type ParseResultInner<T> = ParseResultFailure | ParseResultSuccessInner<T>
export type ParseResult<T> = ParseResultFailure | ParseResultSuccess<T>

const createParser = <T>(arg:Pick<Parser<T>,"consume">):Parser<T> => {
    return {
        ...arg,
        then(action){
            return createParser({
                consume(str:string){
                    const res = arg.consume(str)
                    switch (res.result) {
                        case "match":
                            return {
                                result:res.result,
                                unconsumed:res.unconsumed,
                                content:action(res.content),
                            }
                        case "failure":
                            return {
                                result:res.result
                            }
                    }
                }
            })
        },
        onParsed(cb){
            return createParser({
                consume(str){
                    const res = arg.consume(str)
                    cb(str,res);
                    return res;
                }
            })
        },
        parse(str){
            const res = arg.consume(str);
            if(res.result === "failure"){
                return res
            }
            if(res.unconsumed === ""){
                return {
                    result:res.result,
                    content:res.content,
                }
            }
            return {
                result:"failure"
            }
        },
        validate(predicate){
            return createParser({
                consume(str:string){
                    const res = arg.consume(str)
                    switch (res.result) {
                        case "match":
                            return predicate(res.content) ? res : {
                                result:"failure"
                            }
                        case "failure":
                            return {
                                result:"failure"
                            }
                    }
                }
            })
        },
        not(parser){
            return createParser({
                consume(str:string){
                    const checked = parser.consume(str);
                    switch (checked.result) {
                        case "match":            
                            return {result:"failure"}
                        case "failure":
                            return arg.consume(str)
                    }
                }
            })
        }
    }
}
export const lazy = <T>(factory:() => Parser<T>):Parser<T> => createParser({
    consume(str){
        return factory().consume(str);
    }
})

export const sequence = <T extends Array<unknown>>(...parsers:Parsers<T>): Parser<T> => {
    return createParser({
        consume(str){
            return _matchSeq(str,parsers) as ParseResultInner<T>
        }
    })
}

const _matchSeq = <T>(str:string,parsers:Parser<T>[]):ParseResultInner<T[]> => {
    const fn = (cur:string,num:number = 0,prev:T[]=[]):ParseResultInner<T[]> => {
        const parser = parsers[num]
        const res = parser.consume(cur)
        switch (res.result) {
            case "match":
                const content = [...prev,res.content]
                return parsers[num + 1] ? 
                    fn(res.unconsumed,num + 1,content) : 
                    {result:"match",content,unconsumed:res.unconsumed}
            case "failure":
                return {result:"failure"}
        }
    }
    return fn(str);
}

export const choice = <T extends Array<unknown>>(...parsers:Parsers<T>) :Parser<T[number]> => {
    return createParser({
        consume(str){
            const fn = (num:number = 0):ParseResultInner<T[number]> => {
                const parser = parsers[num]
                if(typeof parser == "undefined") return {result:"failure"};
                const res = parser.consume(str);
                switch (res.result) {
                    case "match":  
                        return res
                    case "failure":
                        return fn(num + 1)
                }
            }
            return fn()
        }
    })
}

export const repeat = <T>(parser:Parser<T>) : Parser<T[]> => {
    return createParser({
        consume(str){
            const fn = (cur:string=str,acc:T[]=[]):ParseResultInner<T[]> => {
                const res = parser.consume(cur);
                switch (res.result) {
                    case "match":
                        const content = [...acc,res.content]
                        return res.unconsumed !== "" ? 
                            fn(res.unconsumed,content) : 
                            {result:"match",content,unconsumed:res.unconsumed}
                    case "failure":
                        return  {result:"match",content:acc,unconsumed:cur}
                }
            }
            return fn();
        }
    })
}

export const regexp = (exp:string):Parser<string> => {
    const matcher = new RegExp(`^(${exp})(.*)$`)
    return createParser({
        consume(str){
            const result = matcher.exec(str);
            if(!result){
                return {result:"failure"}
            }
            const [,content,unconsumed] = result
            return {content,result:"match",unconsumed}
        },
    })
}

const escapeRegExp = (text:string) => text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');

export const str = <S extends string>(literal:S):Parser<S> => {
    const escaped = escapeRegExp(literal);
    const matcher = new RegExp(`^(${escaped})(.*)$`)
    return createParser({
        consume(str){
            const result = matcher.exec(str);
            if(!result){
                return {result:"failure"}
            }
            const [,,unconsumed] = result
            return {content:literal,result:"match",unconsumed}
        },
    })
}

type LeftRec<L,R> = [LeftRec<L,R>,R] | L
export const lrec = <L,R>(left:Parser<L>,right:Parser<R>): Parser<LeftRec<L,R>> => {
    return createParser({
        consume(str){
            const first = left.consume(str)
            if(first.result === "failure"){
                return {
                    result:"failure"
                }
            }
            const fn = (cur:string = first.unconsumed,prev:LeftRec<L,R>=first.content): ParseResultInner<LeftRec<L,R>> => {
                const r = right.consume(cur)
                switch (r.result) {
                    case "match":
                        return fn(r.unconsumed,[prev,r.content])
                    case "failure":
                        return {
                            result:"match",
                            content:prev,
                            unconsumed:cur
                        }
                }
            }
            return fn();
        }
    })
}



