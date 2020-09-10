import { parse } from "."
import { StringEquivalenceComparisonExpression, MultiplicativeExpression } from "../types"
import { Variable,String } from "../core"

describe("パース", () => {
    test("文字列比較（等価）", () => {
        const res = parse("'aaa' == 'aa'")
        const expected: StringEquivalenceComparisonExpression = {
            type: "StringEquivalenceComparisonExpression",
            op: "==",
            _0: { type: 'string', value: 'aaa' },
            _1: { type: 'string', value: 'aa' }
        }
        expect(res).toEqual(expected)
    })
    test("True False", () => {
        const parsedFalse = parse("false");
        const parseExpectedFalse = { type: 'boolean', value: false }
        expect(parsedFalse).toEqual(parseExpectedFalse);
        const parsedTrue = parse("true");
        const parseExpectedTrue = { type: 'boolean', value: true }
        expect(parsedTrue).toEqual(parseExpectedTrue);
    })
    test("文字列・変数比較（不等価）", () => {
        const res = parse("'山田 太郎' != aa")
        const expected: StringEquivalenceComparisonExpression = {
            type: "StringEquivalenceComparisonExpression",
            op: "!=",
            _0: { type: 'string', value: '山田 太郎' },
            _1: {
                type: 'variable',
                prefix: null,
                value: 'aa'
            }
        }
        expect(res).toEqual(expected)
    })
    test("変数単体 否定なし", () => {
        const res = parse("aaaa")
        const expected: Variable = {
            type: "variable",
            prefix: null,
            value: "aaaa"
        }
        expect(res).toEqual(expected)
    })
    test("変数単体 否定あり", () => {
        const res = parse("!aaaa")
        const expected: Variable = {
            type: "variable",
            prefix: "!",
            value: "aaaa"
        }
        expect(res).toEqual(expected)
    })
    test("グルーピング", () => {
        const res = parse("3 * ( 1 + 2 )")
        const expected: MultiplicativeExpression = {
            type: 'MultiplicativeExpression',
            op: '*',
            _0: { type: 'number', value: 3 },
            _1: {
                type: 'AdditiveExpression',
                op: '+',
                _0: { type: 'number', value: 1 },
                _1: { type: 'number', value: 2 }
            }
        }
        expect(res).toEqual(expected)
    })
    test("文字列内のカッコはグルーピングされないよね", () => {
        const res = parse("'3 * (1 + 2)'")
        const expected: String = {
            type: "string",
            value: "3 * (1 + 2)"
        }
        expect(res).toEqual(expected)
    })

})