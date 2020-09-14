import {regexp, chars, sequence, Parser, _matchSeq, choice, recur} from "."

const Num = regexp("[1-9][0-9]*").then(parseInt)
const AtoZ = regexp("[1-9a-z]*")
const AdditveOperator = chars("+")

type Additve = number | AdditiveExpression
type AdditiveExpression = [number,"+",Additve]
const AdditiveExpression : Parser<AdditiveExpression>= sequence(
    Num,
    AdditveOperator,
    recur(() => choice(AdditiveExpression,Num))
)

test("sequence",() => {
    const res2 = _matchSeq<number | "+">("11+12",[Num,AdditveOperator,Num])
    expect(res2).toStrictEqual({result:"match",content:[11,'+',12],unconsumed: ""})
    const res3 = AdditiveExpression.parse("11+12")
    expect(res3).toStrictEqual({result:"match",content:[11,'+',12]})
})

test("choice",() => {
    const res1 = choice(Num,AtoZ).parse("a1")
    expect(res1).toStrictEqual({
        result:"match",
        content:"a1"
    })
    const res2 = choice(Num,AtoZ).parse("123")
    expect(res2).toStrictEqual({
        result:"match",
        content:123
    })
})

test("Additve",() => {
    const res1 = AdditiveExpression.parse("11+12+13")
    expect(res1).toStrictEqual({ result: 'match', content: [ 11, '+', [ 12, '+', 13 ] ] })
})




