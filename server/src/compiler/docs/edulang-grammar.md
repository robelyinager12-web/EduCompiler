# EduLang Language Specification (v1.0)

EduLang is a small educational language analysed by EduCompiler's own lexer, parser and
semantic analyzer. Programs are never executed with eval().

## Lexical rules
- Whitespace is ignored. Comments start with `//` and run to the end of the line.
- Identifier: starts with a letter or `_`, then letters, digits or `_`.
- Integer: digits (max 2147483647). Float: digits `.` digits (both sides required).
- String: text in double quotes on one line. Escapes: `\"` `\\` `\n`.
- Boolean: `true`, `false`.
- Keywords: `int float string bool print if else` (`if`/`else` reserved for later).

## Grammar (simplified EBNF)

    program        -> statement* EOF
    statement      -> variableDeclaration | assignment | printStatement
    variableDeclaration -> type IDENTIFIER ( "=" expression )? ";"
    assignment     -> IDENTIFIER "=" expression ";"
    printStatement -> "print" "(" expression ")" ";"
    type           -> "int" | "float" | "string" | "bool"
    expression     -> comparison
    comparison     -> additive ( ("==" | "!=" | "<" | ">" | "<=" | ">=") additive )*
    additive       -> multiplicative ( ("+" | "-") multiplicative )*
    multiplicative -> unary ( ("*" | "/") unary )*
    unary          -> "-" unary | primary
    primary        -> INTEGER | FLOAT | STRING | BOOLEAN | IDENTIFIER | "(" expression ")"

## Type rules
- int -> float is allowed (widening). float -> int, and any mix with string or bool, is an error.
- int / int is integer division, truncated toward zero.
- `+` on two strings concatenates. Comparisons return bool.
- Variables must be declared before use, once per scope (v1.0 has one scope: global).
- Division by the constant 0 is a semantic error.
- Using a variable that was declared but never assigned is a warning.

## Limitations
No loops, functions, arrays, input, `&&`, `||` or `!`. The compiler analyses programs and
shows educational target code. It does not run them or produce machine code.

## Additional syntax messages (added in Phase 6)
- `Unexpected end of input.`
- `Expression is nested too deeply.` (more than 200 levels of nesting)
- A missing `;` is reported at the end of the previous token.
- Syntax recovery: after an error the parser skips to the next statement, so several
  syntax errors can be reported in one run.
