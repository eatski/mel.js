import * as t from "io-ts";
import { asConstMixed, ToUnion } from "./util";
export const BooleanIO = t.type({
    type:t.literal("boolean"),
    value: t.boolean
});
export type Boolean = t.TypeOf<typeof BooleanIO>

export const NumberIO = t.type({
    type:t.literal("number"),
    value: t.number
})
export type Number = t.TypeOf<typeof NumberIO>

export const StringIO = t.type({
    type:t.literal("string"),
    value: t.string
})

export type String = t.TypeOf<typeof StringIO>

export const VariableIO = t.type({
    type:t.literal("variable"),
    prefix: t.union([t.nullType,t.literal("!")]),
    value: t.string
})

export type Variable = t.TypeOf<typeof VariableIO>

export const ValueIO = t.union([BooleanIO,NumberIO,StringIO,VariableIO])
export type Value = t.TypeOf<typeof ValueIO>

export const MultiplicativeOperatorIOs = asConstMixed([t.literal("*"),t.literal("%"),t.literal("/")])
export type MultiplicativeOperator = ToUnion<typeof MultiplicativeOperatorIOs>

export const AdditiveOperatorIOs = asConstMixed([t.literal("+"),t.literal("-")])
export type AdditiveOperator = ToUnion<typeof AdditiveOperatorIOs>

export const NumericalComparisonOperatorIOs = asConstMixed([t.literal(">"),t.literal("<"),t.literal(">="),t.literal("<=")])
export type NumericalComparisonOperator = ToUnion<typeof NumericalComparisonOperatorIOs>

export const EquivalenceComparisonOperatorIOs = asConstMixed([t.literal("=="),t.literal("!=")])
export type EquivalenceComparisonOperator = ToUnion<typeof EquivalenceComparisonOperatorIOs>
