import { evalExpression } from "./evaluate"
import { parse } from "./parse"
import { StringEquivalenceComparisonExpression, NumericalComparisonExpression, AdditiveExpression, MultiplicativeExpression, EquivalenceComparisonExpression } from "./types"
import { Variable, String } from "./core"

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

describe("パースと評価", () => {
    test("比較 等価", () => {
        const parsed = parse("'aaa' == hoge");
        const parseExpected: StringEquivalenceComparisonExpression = {
            type: "StringEquivalenceComparisonExpression",
            op: '==',
            _0: { type: 'string', value: 'aaa' },
            _1: { type: 'variable', prefix: null, value: 'hoge' }
        }
        expect(parsed).toEqual(parseExpected)
        const evaled1 = evalExpression(parsed, name => name === 'hoge' ? "aaa" : undefined);
        expect(evaled1).toBe(true)
        const evaled2 = evalExpression(parsed, name => name === 'hoge' ? "aai" : undefined);
        expect(evaled2).toBe(false)
    })
    test("比較 大小", () => {
        const parsed = parse("num > 1");
        const parseExpected: NumericalComparisonExpression = {
            type: 'NumericalComparisonExpression',
            op: '>',
            _0: { type: 'variable', prefix: null, value: 'num' },
            _1: { type: 'number', value: 1 }
        }
        expect(parsed).toEqual(parseExpected)
        const evaled1 = evalExpression(parsed, name => name === 'num' ? 2 : undefined);
        expect(evaled1).toBe(true)
        const evaled2 = evalExpression(parsed, name => name === 'num' ? 1 : undefined);
        expect(evaled2).toBe(false)
    })
    test("比較 大小 負の数", () => {
        const parsed = parse("num > -10");
        const parseExpected: NumericalComparisonExpression = {
            type: 'NumericalComparisonExpression',
            op: '>',
            _0: { type: 'variable', prefix: null, value: 'num' },
            _1: { type: 'number', value: -10 }
        }
        expect(parsed).toEqual(parseExpected)
        const evaled1 = evalExpression(parsed, name => name === 'num' ? -9 : undefined);
        expect(evaled1).toBe(true)
        const evaled2 = evalExpression(parsed, name => name === 'num' ? -10 : undefined);
        expect(evaled2).toBe(false)
    })
    test("比較 文法エラー", () => {
        expect(() => parse("'aaa' > -10")).toThrowError()
        expect(() => parse("false > -10")).toThrowError()
    })
    test("True False", () => {
        const parsedFalse = parse("false");
        const parseExpectedFalse = { type: 'boolean', value: false }
        expect(parsedFalse).toEqual(parseExpectedFalse);
        const parsedTrue = parse("true");
        const parseExpectedTrue = { type: 'boolean', value: true }
        expect(parsedTrue).toEqual(parseExpectedTrue);
    })
    test("加算", () => {
        const parsed = parse("num + -10");
        const parseExpected: AdditiveExpression = {
            type: 'AdditiveExpression',
            op: '+',
            _0: { type: 'variable', prefix: null, value: 'num' },
            _1: { type: 'number', value: -10 }
        }
        expect(parsed).toEqual(parseExpected)
        const evaled1 = evalExpression(parsed, name => name === 'num' ? 15 : undefined);
        expect(evaled1).toBe(5)
        const evaled2 = evalExpression(parsed, name => name === 'num' ? -10 : undefined);
        expect(evaled2).toBe(-20)
    })

    test("加算3つ", () => {
        const parsed = parse("num + -10 - 1");
        const parseExpected: AdditiveExpression = {
            type: 'AdditiveExpression',
            op: '+',
            _0: { type: 'variable', prefix: null, value: 'num' },
            _1: {
                type: 'AdditiveExpression',
                op: '-',
                _0: {
                    type: "number",
                    value: -10
                },
                _1: {
                    type: "number",
                    value: 1
                }
            }
        }
        expect(parsed).toEqual(parseExpected)
        const evaled1 = evalExpression(parsed, name => name === 'num' ? 15 : undefined);
        expect(evaled1).toBe(4)
        const evaled2 = evalExpression(parsed, name => name === 'num' ? -10 : undefined);
        expect(evaled2).toBe(-21)
    })

    test("乗算", () => {
        const parsed = parse("1 + num * 2");
        const parseExpected: AdditiveExpression = {
            type: "AdditiveExpression",
            op: "+",
            _0: { type: "number", value: 1 },
            _1: {
                type: "MultiplicativeExpression",
                op: "*",
                _0: {
                    type: "variable",
                    prefix: null,
                    value: "num"
                },
                _1: {
                    type: "number",
                    value: 2
                }
            }
        }
        expect(parsed).toEqual(parseExpected)
        const evaled1 = evalExpression(parsed, name => name === 'num' ? 15 : undefined);
        expect(evaled1).toBe(31)
        const evaled2 = evalExpression(parsed, name => name === 'num' ? -10 : undefined);
        expect(evaled2).toBe(-19)
    })
    test("加算3つ", () => {
        const parsed = parse("num + -10 - 1");
        const parseExpected: AdditiveExpression = {
            type: 'AdditiveExpression',
            op: '+',
            _0: { type: 'variable', prefix: null, value: 'num' },
            _1: {
                type: 'AdditiveExpression',
                op: '-',
                _0: {
                    type: "number",
                    value: -10
                },
                _1: {
                    type: "number",
                    value: 1
                }
            }
        }
        expect(parsed).toEqual(parseExpected)
        const evaled1 = evalExpression(parsed, name => name === 'num' ? 15 : undefined);
        expect(evaled1).toBe(4)
        const evaled2 = evalExpression(parsed, name => name === 'num' ? -10 : undefined);
        expect(evaled2).toBe(-21)
    })

    test("等価比較 3つ", () => {
        const parsed = parse("1 == 2 != false");
        const parseExpected: EquivalenceComparisonExpression = {
            type: "BooleanEquivalenceComparisonExpression",
            op: "!=",
            _0: {
                type: "NumberEquivalenceComparisonExpression",
                op: "==",
                _0: {
                    type: "number",
                    value: 1
                },
                _1: {
                    type: "number",
                    value: 2
                }
            },
            _1: {
                type: "boolean",
                value: false
            }
        }
        expect(parsed).toEqual(parseExpected)
        const evaled1 = evalExpression(parsed, () => undefined);
        expect(evaled1).toBe(false)
    })
    test("等価比較 4つ", () => {
        const parsed = parse("1 == 2 != false == false");
        const parseExpected: EquivalenceComparisonExpression = {
            type: "BooleanEquivalenceComparisonExpression",
            op: "==",
            _0: {
                type: "BooleanEquivalenceComparisonExpression",
                op: "!=",
                _0: {
                    type: "NumberEquivalenceComparisonExpression",
                    op: "==",
                    _0: {
                        type: "number",
                        value: 1
                    },
                    _1: {
                        type: "number",
                        value: 2
                    }
                },
                _1: {
                    type: "boolean",
                    value: false
                }
            },
            _1: {
                type: "boolean",
                value: false
            }
        }
        expect(parsed).toEqual(parseExpected)
        const evaled1 = evalExpression(parsed, () => undefined);
        expect(evaled1).toBe(true)
    })
})

