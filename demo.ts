import prompts, { PromptType } from "prompts";
import {parse,evalExpression} from "./src"
import { Expression } from "./src/types";


type VarType = "string" | "number" | "boolean" | "variable"

interface HoistedVar {
    type: VarType,
    name: string
}

const varTypeToInputType : Record<VarType,PromptType>= {
    string:"text",
    number:"number",
    boolean:"toggle",
    variable:"text"
}

const findVariables = (expression:Expression,type: VarType,acc:HoistedVar[] = []):HoistedVar[] => {
    const add = (targets:HoistedVar[]) => 
        targets.reduce((prev,cur) => prev.some(e => e.name === cur.name) ? prev : [...prev,cur],acc)
    switch (expression.type) {
        case "AdditiveExpression":
        case "MultiplicativeExpression":
        case "NumberEquivalenceComparisonExpression":
        case "NumericalComparisonExpression":
            return add([
                ...findVariables(expression._0,"number",acc),
                ...findVariables(expression._1,"number",acc)
            ])
        case "AnyEquivalenceComparisonExpression":
            return add([
                ...findVariables(expression._0,"variable",acc),
                ...findVariables(expression._1,"variable",acc)
            ])
        case "BooleanEquivalenceComparisonExpression":
            return add([
                ...findVariables(expression._0,"boolean",acc),
                ...findVariables(expression._1,"boolean",acc)
            ])
        case "StringEquivalenceComparisonExpression":
            return add([
                ...findVariables(expression._0,"string",acc),
                ...findVariables(expression._1,"string",acc)
            ])
        case "boolean":
        case "number":
        case "string":
            return acc
        case "variable":
            return add([{name:expression.value,type}])
    }
}

const run = async () => {
    try {
        const { expression } = await prompts([
            {
                type:"text",
                message:"Expression",
                name:"expression"
            }
        ])
        const parsed = parse(expression);
        const variables = findVariables(parsed,"variable")
        const inputs = await prompts(variables.map(variable => ({
            name:variable.name,
            message:variable.name,
            type:varTypeToInputType[variable.type],
            ...(variable.type == "boolean" ? {active: 'true',inactive: 'false',initial:true} : {})
        })))
        console.log(evalExpression(parsed,(name) => inputs[name]))
    } catch (e) {
        console.error(e.message);
    }
}
run()