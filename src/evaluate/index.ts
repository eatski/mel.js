import { Expression, NumberResolvable, AdditiveExpression, StringResolvable, BooleanResolvable, EquivalenceComparisonExpression, AnyEquivalenceComparisonExpression, StringEquivalenceComparisonExpression, BooleanEquivalenceComparisonExpression, NumberEquivalenceComparisonExpression, NumericalComparisonExpression, MultiplicativeExpression } from "../types";
import { Variable, Number, Boolean, String } from "../core";

export class EvalutionError extends Error {}

export const evalExpression = (exp:Expression ,resolve:VariableResolver): string | number | boolean => {
    switch (exp.type) {
        case "variable":
            return evalVariable(exp,resolve).value;
        case "MultiplicativeExpression":
        case "AdditiveExpression":
        case "number":
            return evalNumberResolvable(exp,resolve)
        case "AnyEquivalenceComparisonExpression":
        case "BooleanEquivalenceComparisonExpression":
        case "NumberEquivalenceComparisonExpression":
        case "NumericalComparisonExpression":
        case "StringEquivalenceComparisonExpression":
        case "boolean":
            return evalBooleanResolvable(exp,resolve)
        case "string":
            return evalStringResolvable(exp,resolve)
    }
} 

const evalNumberEquivalenceComparisonExpression = (exp:NumberEquivalenceComparisonExpression,resolve:VariableResolver) : boolean=> {
    const _0 = evalNumberResolvable(exp._0,resolve);
    const _1 = evalNumberResolvable(exp._1,resolve);
    switch (exp.op) {
        case "==":
            return _0 === _1
        case "!=":
            return _0 !== _1
    }
}

const evalNumericalComparisonExpression = (exp:NumericalComparisonExpression,resolve:VariableResolver) : boolean => {
    const _0 = evalNumberResolvable(exp._0,resolve);
    const _1 = evalNumberResolvable(exp._1,resolve);
    switch (exp.op) {
        case "<":
            return _0 < _1;
        case ">":
            return _0 > _1;
        case "<=":
            return _0 <= _1;
        case ">=":
            return _0 >= _1
    }
}

const evalStringEquivalenceComparisonExpression = (exp:StringEquivalenceComparisonExpression,resolve:VariableResolver) : boolean=> {
    const _0 = evalStringResolvable(exp._0,resolve);
    const _1 = evalStringResolvable(exp._1,resolve);
    switch (exp.op) {
        case "==":
            return _0 === _1
        case "!=":
            return _0 !== _1
    }
}

const evalBooleanEquivalenceComparisonExpression = (exp:BooleanEquivalenceComparisonExpression,resolve:VariableResolver) : boolean=> {
    const _0 = evalBooleanResolvable(exp._0,resolve);
    const _1 = evalBooleanResolvable(exp._1,resolve);
    switch (exp.op) {
        case "==":
            return _0 === _1
        case "!=":
            return _0 !== _1
    }
}

const evalAnyEquivalenceComparisonExpression = (exp:AnyEquivalenceComparisonExpression,resolve:VariableResolver) : boolean => {
    const _0 = evalVariable(exp._0,resolve);
    const _1 = evalVariable(exp._1,resolve);
    if(_0.type != _1.type){
        throw new EvalutionError(`Invalid Camparision ${_0.type} and ${_1.type}`)
    }
    switch (exp.op) {
        case "==":
            return _0.value === _1.value
        case "!=":
            return _0.value !== _1.value
    }
    
    
}
interface VariableResolver {
    (name:string):number | string | boolean | undefined
}

const evalNumberResolvable = (expression:NumberResolvable,resolve:VariableResolver):number => {
    switch (expression.type) {
        case "number":            
            return expression.value;
        case "variable":
            return evalVariableAsNumber(expression,resolve);
        case "AdditiveExpression":
            return evalAdditiveExpression(expression,resolve);
        case "MultiplicativeExpression":
            return evalMultiplicativeExpression(expression,resolve);
    }
}

const evalStringResolvable = (str:StringResolvable,resolve:VariableResolver):string => {
    switch (str.type) {
        case "string":            
            return str.value;
        case "variable":
            return evalVariableAsString(str,resolve);
    }
}

const evalBooleanResolvable = (expression:BooleanResolvable,resolve:VariableResolver):boolean => {
    switch (expression.type) {
        case "boolean":            
            return expression.value;
        case "variable":
            return evalVariableAsBoolean(expression,resolve);
        case "AnyEquivalenceComparisonExpression":
            return evalAnyEquivalenceComparisonExpression(expression,resolve)
        case "BooleanEquivalenceComparisonExpression":
            return evalBooleanEquivalenceComparisonExpression(expression,resolve)
        case "NumberEquivalenceComparisonExpression":
            return evalNumberEquivalenceComparisonExpression(expression,resolve)
        case "NumericalComparisonExpression":
            return evalNumericalComparisonExpression(expression,resolve)
        case "StringEquivalenceComparisonExpression":
            return evalStringEquivalenceComparisonExpression(expression,resolve)
    }
}

const evalVariableAsNumber = (variable:Variable,resolve:VariableResolver):number => {
    const res = evalVariable(variable,resolve)
    if(res.type === "number"){
        return res.value;
    }
    throw new EvalutionError(`[${variable.value}] is not number.`)
}
const evalVariableAsString = (variable:Variable,resolve:VariableResolver):string => {
    const res = evalVariable(variable,resolve)
    if(res.type === "string"){
        return res.value;
    }
    throw new EvalutionError(`[${variable.value}] is not string.`)
}

const evalVariableAsBoolean = (variable:Variable,resolve:VariableResolver):boolean => {
    const res = evalVariable(variable,resolve)
    if(res.type === "boolean"){
        return res.value;
    }
    throw new EvalutionError(`[${variable.value}] is not boolean.`)
}

const evalVariable = (variable:Variable,resolve:VariableResolver):Number | Boolean | String=> {
    const value = resolve(variable.value)
    switch (typeof value) {
        case "boolean":
            return {
                type:"boolean",
                value: variable.prefix === "!" ? !value : value
            };
        case "string":
            return {
                type:"string",
                value
            }
        case "number":
            return {
                type:"number",
                value
            }
        default:
            throw new EvalutionError(`[${variable.value}] is ${typeof value}.`)
    }
    
}

const evalAdditiveExpression = (exp:AdditiveExpression,resolve:VariableResolver):number=> {
    const _0 = evalNumberResolvable(exp._0,resolve);
    const _1 = evalNumberResolvable(exp._1,resolve);
    switch (exp.op) {
        case "+":
            return _0 + _1;
        case "-":
            return _0 - _1;
    }
}

const evalMultiplicativeExpression = (exp:MultiplicativeExpression,resolve:VariableResolver):number=> {
    const _0 = evalNumberResolvable(exp._0,resolve);
    const _1 = evalNumberResolvable(exp._1,resolve);
    switch (exp.op) {
        case "*":
            return _0 * _1;
        case "/":
            return _0 / _1;
        case "%":
            return _0 % _1
    }
}

