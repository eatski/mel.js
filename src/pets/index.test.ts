import {regexp, chars, sequence, Parser, choice, recur} from "."

test("sequence",() => {
    const Num = regexp("[1-9][0-9]*").then(parseInt)
    const AdditiveExpression = sequence(Num,chars("+"),Num)
    const res1 = AdditiveExpression.parse("11+12")
    expect(res1).toStrictEqual({result:"match",content:[11,'+',12]})
})

test("choice",() => {
    const Num = regexp("[1-9][0-9]*").then(parseInt)
    const AtoZ = regexp("[1-9a-z]*")
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

test("Calulate Additive",() => {
    const Num = regexp("[1-9][0-9]*").then(parseInt)
    const AdditveOperator = chars("+")
    const Additive = recur(() => choice(AdditiveExpression,Num))
    const AdditiveExpression : Parser<number> = sequence(Num,AdditveOperator,Additive)
        .then(([left,,right])=> left + right)
    const res1 = AdditiveExpression.parse("10+90+11")
    expect(res1).toStrictEqual({ result: 'match', content: 111 })
})

test("Additive",() => {
    const Num = regexp("[1-9][0-9]*").then(parseInt)
    const AdditveOperator = chars("+")
    type Additive = AdditiveExpression | number
    const Additive = recur(() => choice(AdditiveExpression,Num))
    type AdditiveExpression = [number, "+" ,Additive]
    const AdditiveExpression : Parser<AdditiveExpression> = sequence(Num,AdditveOperator,Additive)
    const res1 = AdditiveExpression.parse("10+90+11")
    expect(res1).toStrictEqual({ result: 'match', content: [ 10, '+', [ 90, '+', 11 ] ] })
})




