import * as t from "io-ts";

export type ToUnion<T extends [t.Mixed,t.Mixed,...t.Mixed[]]> = t.TypeOf<t.UnionC<T>>
export const asConstMixed = <T extends [t.Mixed,t.Mixed,...t.Mixed[]]>(arg:T):T => arg

type UnMixed<T extends [t.Mixed,t.Mixed,...t.Mixed[]]> = {
    -readonly [P in keyof T]:T[P] extends t.Any ? t.TypeOf<T[P]> : never
}[number]

export const recursiveUnion = <T extends [t.Mixed,t.Mixed,...t.Mixed[]]>(fn:() => T):t.Type<UnMixed<T>> => t.recursion("hoge",() => t.union(fn()))