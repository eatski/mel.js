import { regexp, str, sequence, Parser, choice, lazy, repeat, ParseResult } from "."

const log = (name: string) => (...args: any) => console.log(name, ...args)

test("sequence", () => {
    const Num = regexp(/[1-9][0-9]*/).then(parseInt)
    const AdditiveExpression = sequence(Num, str("+"), Num)
    const res1 = AdditiveExpression.parse("11+12")
    expect(res1).toStrictEqual({ result: "match", content: [11, '+', 12] })
})

test("choice", () => {
    const Num = regexp(/[1-9][0-9]*/).then(parseInt)
    const AtoZ = regexp(/[1-9a-z]*/)
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

test("not", () => {
    const Bool = choice(str("false"), str("true"))
    const AtoZ = regexp(/[1-9a-z]*/)
    const res1 = AtoZ.not(Bool).parse("false")
    const expect1 : typeof res1 = {
        result:"failure",
        cause:"false",
        messages:["TODO:"]
    }
    expect(res1).toEqual(expect1)
    const res2 = AtoZ.not(Bool).parse("notfalse")
    expect(res2).toEqual({ result: "match", content: "notfalse" })
})

test("XML", () => {
    const Text = regexp(/[\w ]+/)
    const Blank = regexp(/\s*/)
    const trimableRight = <T>(parser:Parser<T>) : Parser<T> => sequence(parser,Blank).then(([left])=> left)
    const trimable = <T>(parser:Parser<T>) : Parser<T> => sequence(Blank,parser,Blank).then(([,content])=> content)
    const simpleMutliLines = `
        hoge
    `
    const blankRes = trimable(str("hoge")).parse(simpleMutliLines)
    const blankExpected : typeof blankRes = {
        result:"match",
        content:"hoge"
    }
    expect(blankRes).toEqual(blankExpected)
    const TagName = trimableRight(regexp(/[a-z]+/))
    const AttrName = regexp(/[a-zA-z]+/)
    const AttrValue = sequence(str("'"),Text,str("'")).then(([,text]) => text)
    const Attr = trimableRight(sequence(AttrName,str("="),AttrValue).then(([name,,value])=> ({name,value})))
    const TagStart = trimableRight(sequence(str("<"),TagName, repeat(Attr) ,str(">")).then(([, name,attrs]) => ({name,attrs})))
    const TagEnd = sequence(str("</"), TagName,Blank, str(">")).then(([, name,]) => name)
    type TaggedElement = {
        tagName: string,
        elements: (TaggedElement | string)[],
        attrs:{name:string,value:string}[]
    }
    const TaggedElement: Parser<TaggedElement> =
        sequence(TagStart, lazy(() => XML), TagEnd)
            .validate(([tagStart, , tagEnd]) => tagStart.name === tagEnd)
            .then(([tagStart, elements]) => ({ tagName:tagStart.name,attrs:tagStart.attrs,elements }))
    const Element = choice(trimable(TaggedElement), Text)
    const XML = repeat(Element)

    const xmlText = "<body><p class='hoge'>hello</p>world<div>friend</div></body>"
    const res = XML.parse(xmlText)
    const expected : typeof res = {
        result: "match",
        content: [{
            tagName: "body",
            attrs:[],
            elements: [
                { tagName: "p", attrs:[{name:"class",value:"hoge"}],elements: ["hello"] },
                "world",
                { tagName: "div", attrs:[],elements: ["friend"] }
            ]
        }]
    }
    expect(res).toEqual(expected)
    const xmlTextWithMutliLines = `
        <body>
            <p class='hoge'>hello</p>
            world
            <div>friend</div>
        </body>
    `
    const resNL = XML.parse(xmlTextWithMutliLines)
    expect(resNL).toEqual(expected)
    const res2 = TaggedElement.parse("<a>hello</b>")
    const expected2 : typeof res2 = {
        result:"failure",
        messages:["Validation Error"],
        cause:"<a>hello</b>"
    }
    expect(res2).toEqual(expected2)
})


test("Calulate Additive", () => {
    const Num = regexp(/[1-9][0-9]*/).then(parseInt)
    const AdditveOperator = str("+")
    const Additive = lazy(() => choice(AdditiveExpression, Num))
    const AdditiveExpression: Parser<number> = sequence(Num, AdditveOperator, Additive)
        .then(([left, , right]) => left + right)
    const res1 = AdditiveExpression.parse("10+90+11")
    expect(res1).toStrictEqual({ result: 'match', content: 111 })
})

test("Additive", () => {
    const Num = regexp(/[1-9][0-9]*/).then(parseInt)
    const AdditveOperator = str("+")
    type Additive = AdditiveExpression | number
    const Additive = lazy(() => choice(AdditiveExpression, Num))
    type AdditiveExpression = [number, "+", Additive]
    const AdditiveExpression: Parser<AdditiveExpression> = sequence(Num, AdditveOperator, Additive)
    const res1 = AdditiveExpression.parse("10+90+11")
    expect(res1).toStrictEqual({ result: 'match', content: [10, '+', [90, '+', 11]] })
})




