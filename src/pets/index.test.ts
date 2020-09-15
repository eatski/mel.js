import { regexp, str, sequence, Parser, choice, lazy, repeat, ParseResult } from "."

const log = (name: string) => (...args: any) => console.log(name, ...args)

test("sequence", () => {
    const Num = regexp("[1-9][0-9]*").then(parseInt)
    const AdditiveExpression = sequence(Num, str("+"), Num)
    const res1 = AdditiveExpression.parse("11+12")
    expect(res1).toStrictEqual({ result: "match", content: [11, '+', 12] })
})

test("choice", () => {
    const Num = regexp("[1-9][0-9]*").then(parseInt)
    const AtoZ = regexp("[1-9a-z]*")
    const res1 = choice(Num, AtoZ).parse("a1")
    expect(res1).toStrictEqual({
        result: "match",
        content: "a1"
    })
    const res2 = choice(Num, AtoZ).parse("123")
    expect(res2).toStrictEqual({
        result: "match",
        content: 123
    })
})

test("not",() => {
    const Bool = choice(str("false"),str("true"))
    const AtoZ = regexp("[1-9a-z]*")
    const res1 = AtoZ.not(Bool).parse("false")
    expect(res1).toEqual({result:"failure"})
    const res2 = AtoZ.not(Bool).parse("notfalse")
    expect(res2).toEqual({result:"match",content:"notfalse"})
})

test("XML", () => {
    const Text = regexp("[a-zA-z]+")
    const TagName = regexp("[a-z]+")
    const TagStart = sequence(str("<"), TagName, str(">")).then(([, name,]) => name)
    const TagEnd = sequence(str("</"), TagName, str(">")).then(([, name,]) => name)
    type Xml = {
        tagName: string,
        elements: (Xml | string)[]
    }
    const Xml: Parser<Xml> =
        lazy(() => sequence(TagStart, Elements, TagEnd))
            .validate(([tagStart,,tagEnd])=> tagStart === tagEnd)
            .then(([tagName, elements]) => ({ tagName, elements }))
    const Element = choice(Xml, Text)
    const Elements = repeat(Element)
    const res1 = Xml.parse("<body><p>hello</p>world<div>friend</div></body>")
    const expect1: ParseResult<Xml> = {
        result: "match",
        content: {
            tagName: "body",
            elements: [
                { tagName: "p", elements: ["hello"] },
                "world",
                { tagName: "div", elements: ["friend"] }
            ]
        }
    }
    expect(res1).toEqual(expect1)
    const res2 = Xml.parse("<a>hello</b>")
    expect(res2).toEqual({result:"failure"})
})

test("Calulate Additive", () => {
    const Num = regexp("[1-9][0-9]*").then(parseInt)
    const AdditveOperator = str("+")
    const Additive = lazy(() => choice(AdditiveExpression, Num))
    const AdditiveExpression: Parser<number> = sequence(Num, AdditveOperator, Additive)
        .then(([left, , right]) => left + right)
    const res1 = AdditiveExpression.parse("10+90+11")
    expect(res1).toStrictEqual({ result: 'match', content: 111 })
})

test("Additive", () => {
    const Num = regexp("[1-9][0-9]*").then(parseInt)
    const AdditveOperator = str("+")
    type Additive = AdditiveExpression | number
    const Additive = lazy(() => choice(AdditiveExpression, Num))
    type AdditiveExpression = [number, "+", Additive]
    const AdditiveExpression: Parser<AdditiveExpression> = sequence(Num, AdditveOperator, Additive)
    const res1 = AdditiveExpression.parse("10+90+11")
    expect(res1).toStrictEqual({ result: 'match', content: [10, '+', [90, '+', 11]] })
})




