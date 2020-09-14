import {_matchSeqSingle,regexp, chars, sequence, Parser, _matchSeq, choice, recur} from "."

const Num = regexp(/^[1-9][0-9]*$/).then(parseInt)
const AtoZ = regexp(/^[a-z]*$/)
const AdditveOperator = chars("+")

type Additve = number | AdditiveExpression
type AdditiveExpression = [number,"+",Additve]
const AdditiveExpression : Parser<AdditiveExpression>= sequence(
    Num,
    AdditveOperator,
    recur(() => choice(AdditiveExpression,Num))
)

test("sequence",() => {
    const res1 = _matchSeqSingle("11+12",Num)
    expect(res1).toStrictEqual({
        result:"match",
        content:11,
        right:"+12"
    })
    const res2 = _matchSeq<number | "+">("11+12",[Num,AdditveOperator,Num])
    expect(res2).toStrictEqual({result:"match",content:[11,'+',12]})
    const res3 = AdditiveExpression.parse("11+12")
    expect(res3).toStrictEqual({result:"match",content:[11,'+',12]})
})

test("choice",() => {
    const res1 = choice(Num,AtoZ).parse("aa")
    expect(res1).toStrictEqual({
        result:"match",
        content:"aa"
    })
})

test("Additve",() => {
    const res1 = AdditiveExpression.parse("11+12+13")
    expect(res1).toStrictEqual({ result: 'match', content: [ 11, '+', [ 12, '+', 13 ] ] })
})




