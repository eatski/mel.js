export interface Parser<T> {
    __parse__AllowUnconsumed__(str:string):ParserResultInner<T>,
    parse(str:string):ParserResult<T>
    then<R>(mapper: (result:T) => R):Parser<R>
}
export const recur = <T>(factory:() => Parser<T>):Parser<T> => createMatcher({
    __parse__AllowUnconsumed__(str){
        return factory().__parse__AllowUnconsumed__(str);
    }
})
type Parsers<T> = { [P in keyof T]: Parser<T[P]> };

type ParseResultTypeSuccess = "match" 
type ParseResultTypeFailure = "not" 
type ParseResultSuccess<T> = {result:ParseResultTypeSuccess,content:T}
type ParseResultSuccessInner<T> = {result:ParseResultTypeSuccess,content:T,unconsumed:string}
type ParseResultFailure = {result:ParseResultTypeFailure}

export type ParserResultInner<T> = ParseResultFailure | ParseResultSuccessInner<T>
export type ParserResult<T> = ParseResultFailure | ParseResultSuccess<T>

const createMatcher  = <T>(arg:Pick<Parser<T>,"__parse__AllowUnconsumed__">):Parser<T> => {
    return {
        ...arg,
        then(mapper){
            return createMatcher({
                __parse__AllowUnconsumed__(str:string){
                    const res = arg.__parse__AllowUnconsumed__(str)
                    switch (res.result) {
                        case "match":
                            return {
                                result:res.result,
                                unconsumed:res.unconsumed,
                                content:mapper(res.content),
                            }
                        case "not":
                            return {
                                result:res.result
                            }
                    }
                }
            })
        },
        parse(str){
            const res = arg.__parse__AllowUnconsumed__(str);
            if(res.result === "not"){
                return res
            }
            if(res.unconsumed === ""){
                return {
                    result:res.result,
                    content:res.content,
                }
            }
            return {
                result:"not"
            }
        }
    }
}

export const choice = <T extends Array<unknown>>(...parsers:Parsers<T>) :Parser<T[number]> => {
    return createMatcher({
        __parse__AllowUnconsumed__(str){
            const fn = (num:number = 0):ParserResultInner<T[number]> => {
                const parser = parsers[num]
                if(typeof parser == "undefined") return {result:"not"};
                const res = parser.__parse__AllowUnconsumed__(str);
                switch (res.result) {
                    case "match":  
                        return res
                    case "not":
                        return fn(num + 1)
                }
            }
            return fn()
        }
    })
}

export const regexp = (exp:string):Parser<string> => {
    const matcher = new RegExp(`^(${exp})(.*)$`)
    return createMatcher({
        __parse__AllowUnconsumed__(str){
            const result = matcher.exec(str);
            if(!result){
                return {result:"not"}
            }
            const [,content,unconsumed] = result
            return {content:content,result:"match",unconsumed}
        },
    })
}

const escapeRegExp = (text:string) => text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');

export const chars = <S extends string>(literal:S):Parser<S> => {
    const escaped = escapeRegExp(literal);
    const matcher = new RegExp(`^(${escaped})(.*)$`)
    return createMatcher({
        __parse__AllowUnconsumed__(str){
            const result = matcher.exec(str);
            if(!result){
                return {result:"not"}
            }
            const [,,unconsumed] = result
            return {content:literal,result:"match",unconsumed}
        },
    })
}

export const sequence = <T extends Array<unknown>>(...parsers:Parsers<T>): Parser<T> => {
    return createMatcher({
        __parse__AllowUnconsumed__(str){
            return _matchSeq(str,parsers) as ParserResultInner<T>
        }
    })
}

export const _matchSeq = <T>(str:string,parsers:Parser<T>[]):ParserResultInner<T[]> => {
    const fn = (cur:string,num:number = 0,prev:T[]=[]):ParserResultInner<T[]> => {
        const parser = parsers[num]
        const res = parser.__parse__AllowUnconsumed__(cur)
        switch (res.result) {
            case "match":
                if(parsers[num + 1]) {
                    return fn(res.unconsumed,num + 1,[...prev,res.content])
                } else {
                    return {result:"match",content:[...prev,res.content],unconsumed:res.unconsumed}
                }
            case "not":
                return {
                    result:res.result
                }
        }
    }
    return fn(str);
}
