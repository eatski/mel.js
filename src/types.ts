import { MultiplicativeOperator, AdditiveOperator, NumericalComparisonOperator, EquivalenceComparisonOperator, String, Variable, Number, Boolean } from "./core"

export type Expression = NumberResolvable | BooleanResolvable | StringResolvable | AnyResolvable
export type NumberResolvable = MultiplicativeExpression | AdditiveExpression | Number | AnyResolvable
export type BooleanResolvable = NumericalComparisonExpression | EquivalenceComparisonExpression | Boolean | AnyResolvable
export type StringResolvable = String | AnyResolvable
export type AnyResolvable = Variable

export interface MultiplicativeExpression {
    type:"MultiplicativeExpression",
    op:MultiplicativeOperator,
    _0:NumberResolvable,
    _1:NumberResolvable
}

export interface AdditiveExpression {
    type:"AdditiveExpression",
    op:AdditiveOperator,
    _0:NumberResolvable,
    _1:NumberResolvable
}

export interface NumericalComparisonExpression {
    type:"NumericalComparisonExpression",
    op:NumericalComparisonOperator,
    _0:NumberResolvable,
    _1:NumberResolvable
}

export interface NumberEquivalenceComparisonExpression {
    type:"NumberEquivalenceComparisonExpression",
    op:EquivalenceComparisonOperator,
    _0:NumberResolvable,
    _1:NumberResolvable
}

export interface BooleanEquivalenceComparisonExpression {
    type:"BooleanEquivalenceComparisonExpression",
    op:EquivalenceComparisonOperator,
    _0:BooleanResolvable,
    _1:BooleanResolvable
}

export interface StringEquivalenceComparisonExpression {
    type:"StringEquivalenceComparisonExpression",
    op:EquivalenceComparisonOperator,
    _0:StringResolvable,
    _1:StringResolvable
}

export interface AnyEquivalenceComparisonExpression {
    type:"AnyEquivalenceComparisonExpression",
    op:EquivalenceComparisonOperator,
    _0:AnyResolvable,
    _1:AnyResolvable
}

export type EquivalenceComparisonExpression = 
    NumberEquivalenceComparisonExpression | 
    BooleanEquivalenceComparisonExpression | 
    StringEquivalenceComparisonExpression | 
    AnyEquivalenceComparisonExpression