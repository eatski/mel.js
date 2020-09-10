import { evalExpression } from "./evaluate"
import { parse } from "./parse"

describe("E2E", () => {
    test("Equality operators", () => {
        const parsed1 = parse("'aaa' == str");
        expect(evalExpression(parsed1, {str:"aaa"})).toBe(true)
        expect(evalExpression(parsed1, {str:"aai"})).toBe(false)
        const parsed2 = parse("num == 5");
        expect(evalExpression(parsed2, {num:5})).toBe(true)
        expect(evalExpression(parsed2, {num:3})).toBe(false)
        const parsed3 = parse("'aaa' != str");
        expect(evalExpression(parsed3, {str:"aaa"})).toBe(false)
        expect(evalExpression(parsed3, {str:"aai"})).toBe(true)
        const parsed4 = parse("num != 5");
        expect(evalExpression(parsed4, {num:5})).toBe(false)
        expect(evalExpression(parsed4, {num:3})).toBe(true)
        const parsed5 = parse("num == 5 == false");
        expect(evalExpression(parsed5, {num:5})).toBe(false)
        expect(evalExpression(parsed5, {num:3})).toBe(true)
    })
    test("Relational operators", () => {
        const parsed1 = parse("num > 1");
        expect(evalExpression(parsed1, {num:1})).toBe(false);
        expect(evalExpression(parsed1, {num:2})).toBe(true);
        const parsed2 = parse("num < 1");
        expect(evalExpression(parsed2, {num:0})).toBe(true);
        expect(evalExpression(parsed2, {num:1})).toBe(false);
        const parsed3 = parse("num <= 1");
        expect(evalExpression(parsed3, {num:1})).toBe(true);
        expect(evalExpression(parsed3, {num:2})).toBe(false);
        const parsed4 = parse("num >= 1");
        expect(evalExpression(parsed4, {num:0})).toBe(false);
        expect(evalExpression(parsed4, {num:1})).toBe(true);
    })
    test("Arithmetic operators", () => {
        const parsed1 = parse("num + 10");
        expect(evalExpression(parsed1, {num:1})).toBe(11);
        const parsed2 = parse("num - 10");
        expect(evalExpression(parsed2, {num:1})).toBe(-9);
        const parsed3 = parse("num * 3");
        expect(evalExpression(parsed3, {num:2})).toBe(6);
        const parsed4 = parse("num / 3");
        expect(evalExpression(parsed4, {num:6})).toBe(2);
        expect(evalExpression(parsed4, {num:10})).toBe(3);
        const parsed5 = parse("10 % num");
        expect(evalExpression(parsed5, {num:3})).toBe(1);
        const parsed6 = parse("1 + num * 10");
        expect(evalExpression(parsed6, {num:1})).toBe(11);
        const parsed7 = parse("num1 + 1 - num2");
        expect(evalExpression(parsed7, {num1:2,num2:4})).toBe(-1);
    })
    test("Grouping",() => {
        const parsed1 = parse("(num + 5) * 3");
        expect(evalExpression(parsed1, {num:2})).toBe(21)
        const parsed2 = parse("num == 5 == (str == 'foo')");
        expect(evalExpression(parsed2, {num:5,str:"foo"})).toBe(true)
    })
    test("Syntax Error", () => {
        expect(() => parse("'aaa' > -10")).toThrowError()
        expect(() => parse("false > -10")).toThrowError()
        expect(() => parse("false + -10")).toThrowError()
    })
})

