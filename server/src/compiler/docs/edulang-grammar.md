# EduLang Language Specification (v1.0)

EduLang is a small educational language used by EduCompiler. It is analysed by our own
lexer, parser and semantic analyzer. EduLang programs are never executed with eval().

## 1. Program structure

A program is a list of statements. Every statement ends with `;`.

```text
int age = 20;      // a declaration with an initial value
float tax;         // a declaration without a value
age = age + 1;     // an assignment
print(age);        // a print statement
```

## 2. Lexical rules

| Element | Rule |
|---|---|
| Whitespace | Spaces, tabs, newlines. Ignored. |
| Comment | `//` up to the end of the line. Ignored. |
| Identifier | Starts with a letter or `_`, then letters, digits or `_` |
| Integer literal | One or more digits: `0`, `42`. Maximum 2147483647. |
| Float literal | Digits, a dot, digits: `2.5`. Both sides of the dot are required. |
| String literal | Text between double quotes on one line. Escapes: `\"`, `\\`, `\n` |
| Boolean literal | `true` or `false` |
| Keywords | `int float string bool print if else` |

`if` and `else` are reserved now. Using them as identifiers is an error, and the
statements themselves are added in a later extension.

### Token types

| Lexeme | Token type |
|---|---|
| `int` `float` `string` `bool` `print` `if` `else` | KEYWORD |
| names | IDENTIFIER |
| `20` | INTEGER_LITERAL |
| `2.5` | FLOAT_LITERAL |
| `"text"` | STRING_LITERAL |
| `true` `false` | BOOLEAN_LITERAL |
| `=` | ASSIGNMENT_OPERATOR |
| `+` `-` `*` `/` | PLUS, MINUS, STAR, SLASH |
| `==` `!=` `<` `>` `<=` `>=` | EQUAL_EQUAL, BANG_EQUAL, LESS, GREATER, LESS_EQUAL, GREATER_EQUAL |
| `(` `)` | LEFT_PAREN, RIGHT_PAREN |
| `{` `}` | LEFT_BRACE, RIGHT_BRACE (reserved for blocks) |
| `;` | SEMICOLON |
| end of input | EOF |

## 3. Grammar (simplified EBNF)

```text
program        → statement* EOF

statement      → variableDeclaration
               | assignment
               | printStatement

variableDeclaration
               → type IDENTIFIER ( "=" expression )? ";"

assignment     → IDENTIFIER "=" expression ";"

printStatement → "print" "(" expression ")" ";"

type           → "int" | "float" | "string" | "bool"

expression     → comparison
comparison     → additive ( ( "==" | "!=" | "<" | ">" | "<=" | ">=" ) additive )*
additive       → multiplicative ( ( "+" | "-" ) multiplicative )*
multiplicative → unary ( ( "*" | "/" ) unary )*
unary          → "-" unary | primary
primary        → INTEGER_LITERAL | FLOAT_LITERAL | STRING_LITERAL | BOOLEAN_LITERAL
               | IDENTIFIER
               | "(" expression ")"
```

`unary` is the only change from the original grammar. It adds negative numbers.

### Precedence (highest first)

1. Parentheses
2. Unary `-`
3. `*` `/`
4. `+` `-`
5. `== != < > <= >=`

Binary operators associate left to right: `10 - 3 - 2` means `(10 - 3) - 2`.

### Later extension (not implemented in v1.0)

```text
statement → ... | ifStatement
ifStatement → "if" "(" expression ")" block ( "else" block )?
block       → "{" statement* "}"
```

## 4. Types and semantic rules

### Assignment compatibility

| Variable type | Accepts |
|---|---|
| int | int |
| float | float, int |
| string | string |
| bool | bool |

### Operator typing

| Operator | Operand types | Result |
|---|---|---|
| `+` | int, int | int |
| `+` | float with float or int | float |
| `+` | string, string | string (concatenation) |
| `-` `*` | numeric, numeric | int if both int, else float |
| `/` | int, int | int (integer division, truncated toward zero) |
| `/` | any float involved | float |
| unary `-` | int or float | same type |
| `==` `!=` | both numeric, or both the same type | bool |
| `<` `>` `<=` `>=` | numeric, numeric | bool |

"Numeric" means int or float. Everything else is a type error.

### Other rules

- A variable must be declared before it is used.
- A name can be declared only once per scope. v1.0 has one scope, called `global`.
- Division by the constant `0` is a semantic error.
- Using a variable that has been declared but never assigned is a **warning**.
- `print` accepts an expression of any type.

## 5. Error catalogue

Every diagnostic has a phase, a message, a line and a column. Lines and columns start at 1.

| Phase | Message |
|---|---|
| lexical | `Invalid character 'X'.` |
| lexical | `Unterminated string literal.` |
| lexical | `Integer literal 'N' is out of range.` |
| lexical | `Invalid escape sequence '\X' in string.` |
| syntax | `Expected ';' after statement.` |
| syntax | `Expected ')' after expression.` |
| syntax | `Expected '(' after 'print'.` |
| syntax | `Expected expression.` |
| syntax | `Expected variable name after type.` |
| syntax | `Unexpected token 'X'.` |
| syntax | `'if' statements are not supported yet.` |
| semantic | `Undeclared variable 'x'.` |
| semantic | `Variable 'x' is already declared in this scope.` |
| semantic | `Cannot assign STRING to INT.` (types in capitals) |
| semantic | `Operator '-' cannot be applied to STRING and INT.` |
| semantic | `Operator '-' cannot be applied to STRING.` (unary) |
| semantic | `Division by zero.` |
| semantic (warning) | `Variable 'x' is used before it is assigned.` |

## 6. Examples

### Valid

```text
int a = 10;
int b = 20;
int result = a + b * 2;
float tax = 2;        // int widened to float
string name = "Student";
bool ok = result > 30;
print(result);
print(name);
```

### Invalid

```text
int age = "hello";    // Semantic: Cannot assign STRING to INT.
print(unknown);       // Semantic: Undeclared variable 'unknown'.
```

```text
int x = 5             // Syntax: Expected ';' after statement.
print(x;              // Syntax: Expected ')' after expression.
int y = 3 $ 4;        // Lexical: Invalid character '$'.
```

## 7. Limitations (by design)

- No loops, functions, arrays or input.
- No `&&`, `||` or `!` operators.
- No float exponents, hexadecimal numbers or block comments.
- The compiler analyses programs and shows educational target code. It does not run them
  or produce machine code.