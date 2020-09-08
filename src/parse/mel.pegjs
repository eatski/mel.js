Start = Expression
Expression = EquivalenceComparisonExpression / EquivalenceComparable

//Value > Grouping > Function > Multiplication > Addition > NumericalComparison > Equality

// EquivalenceComparison
EquivalenceComparisonExpression
    = left:EquivalenceComparable _ infix:EqualityOperator _ right:(EquivalenceComparisonExpression / EquivalenceComparable) {
        return  {
            type: "EquivalenceComparisonExpression",
            infix,
            left,
            right
        }
    }

EquivalenceComparable = NumericalComparisonExpression / NumericalComparable
EqualityOperator
    = "==" / "!="

// NumericalComparison
NumericalComparisonExpression 
    = left: NumericalComparable _ infix:NumericalComparisonOperator _ right:(NumericalComparisonExpression / NumericalComparable) {
        return  {
            type: "NumericalComparisonExpression",
            infix,
            left,
            right
        }
    }

NumericalComparable = AdditiveExpression / Addable
NumericalComparisonOperator = ">" / "<" / ">=" / "<="

// Addition

AdditiveExpression 
    = left:Addable _ infix:AdditiveOperator _ right:(AdditiveExpression / Addable) {
        return {
            type: "AdditiveExpression",
            infix,
            left,
            right
        }
    }

Addable = MultiplicativeExpression / Value

AdditiveOperator
    = "+" / "-"

// Multiplicative
MultiplicativeExpression
    = left:Multiplicable _ infix:MultiplicativeOperator _ right:(MultiplicativeExpression / Multiplicable) {
        return  {
            type: "MultiplicativeExpression",
            infix,
            left,
            right
        }
    }
Multiplicable = Value
MultiplicativeOperator = "*" / "/" / "%"

// Value
Value = NumberValue / StringValue / BoolValue / AnyValue / Grouping

NumberValue
    = digits:DigitLiteral {
        return {
            type:"number",
            value:parseInt(digits.join(""))
        }
    }

StringValue
    = "'" charset:CharLiteral+ "'" { 
        return {
            type:"string",
            value:charset.join("")
        }
    }
BoolValue 
    = bool:BoolLiteral {
        return {
            type:"boolean",
            value: bool === "true"
        }
    }

AnyValue
    = Variable
Variable
    = &Keywords / prefix:VariablePrefix charset:[A-z]+{ 
        return {
            type:"variable",
            prefix,
            value:charset.join("")
        }
    }
VariablePrefix
    = [!]?

//Literal
Keywords = BoolLiteral 
BoolLiteral = "true" / "false"
DigitLiteral = "0" / [-]? [1-9] [0-9]*
CharLiteral = [^']

Grouping = "(" _ content:Expression _ ")" {
    return {
        type:"Grouping",
        content
    }
}


_ "whitespace"
  = [ \t\n\r]*