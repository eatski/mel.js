export interface Parser<T> {
    parse(str:string):ParseResult<T>,
    then<R>(mapper: (result:T) => R):Parser<R>
}
export const recur = <T>(factory:() => Parser<T>):Parser<T> => createMatcher({
    parse(str){
        return factory().parse(str);
    }
})
type Parsers<T> = { [P in keyof T]: Parser<T[P]> };

type ParseResultTypeSuccess = "match" | "exact"
type ParseResultTypeFailure = "not" 
type ParseResultSuccess<T> = {result:ParseResultTypeSuccess,content:T}
type ParseResultFailure = {result:ParseResultTypeFailure}

export type ParseResult<T> = ParseResultFailure | ParseResultSuccess<T>

const createMatcher  = <T>(arg:Pick<Parser<T>,"parse">):Parser<T> => {
    return {
        ...arg,
        then(mapper){
            return createMatcher({
                parse(str:string){
                    const res = arg.parse(str)
                    switch (res.result) {
                        case "exact":
                        case "match":
                            return {
                                result:res.result,
                                content:mapper(res.content)
                            }
                        case "not":
                            return {
                                result:res.result
                            }
                    }
                }
            })
        }
    }
}

export const choice = <T extends Array<unknown>>(...parsers:Parsers<T>) :Parser<T[number]> => {
    return createMatcher({
        parse(str){
            const fn = (num:number = 0):ParseResult<T[number]> => {
                const parser = parsers[num]
                if(typeof parser == "undefined") return {result:"not"};
                const res = parser.parse(str);
                switch (res.result) {
                    case "exact":
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

export const regexp = (exp:RegExp):Parser<string> => {
    return createMatcher({
        parse(str){
            return exp.test(str) ? {content:str,result:"match"} : {result:"not"}
        },
    })
}

export const chars = <S extends string>(matcher:S):Parser<S> => {
    return createMatcher({
        parse(str:string){
            return matcher === str ? 
                {content:matcher,result:"exact"} : {result:"not"}
        }
    })
}

export const sequence = <T extends Array<unknown>>(...parsers:Parsers<T>): Parser<T> => {
    return createMatcher({
        parse(str){
            return _matchSeq(str,parsers) as ParseResult<T>
        }
    })
}

export const _matchSeq = <T>(str:string,parsers:Parser<T>[]):ParseResult<T[]> => {
    const fn = (cur:string,num:number = 0,prev:ParseResultSuccess<T[]>={result:"exact",content:[]}):ParseResult<T[]> => {
        const parser = parsers[num]
        if(typeof parser == "undefined")return prev;
        const res = _matchSeqSingle(cur,parser);
        switch (res.result) {
            case "exact":
            case "match":
                return fn(res.right,num + 1,{
                    result:res.result,
                    content:[...prev.content,res.content]
                })
            case "not":
                return {
                    result:res.result
                }
        }
    }
    return fn(str);
}

type SearchResult<T> = (ParseResultSuccess <T> & {right:string}) | ParseResultFailure
export const _matchSeqSingle = <T>(str:string,parser:Parser<T>):SearchResult<T> => {
    const fn = (num:number = 1,prev:SearchResult<T> = {result:"not"}):SearchResult<T> => {
        if(num > str.length) return prev;
        const target = str.substr(0,num);
        const res = parser.parse(target);
        switch (res.result) {
            case "exact":
                return {
                    ...res,
                    right:str.substr(num)
                }
            case "match":
                return fn(num + 1,{
                    ...res,
                    right:str.substr(num)
                }) 
            case "not":
                return fn(num + 1,prev)
        }
    }
    return fn()
}