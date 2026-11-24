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

## Semantic analysis notes (added in Phase 7)
- The initializer is checked before the variable is declared, so `int x = x;` is an error.
- A variable stays declared after a type error in its initializer, to avoid follow-up noise.
- An expression that already reported an error produces no further errors.
- The symbol table `Value` column is the constant initializer, or empty if it is not constant.
- Warnings do not stop compilation. Errors do.

## Intermediate code notes (added in Phase 8)
- Three-Address Code (TAC): each instruction has at most one operation.
- A declaration or assignment computes its value into a temporary (`t1 = 10`), then assigns it (`a = t1`).
- Variables and constants are used directly inside operations: `t3 = a + b`.
- `print` uses its operand directly. Expressions go through a temporary first.
- A declaration without a value generates no instruction.
- Every instruction records its result type. For `/`, a result type of int means integer division.
- TAC is only generated for programs with no lexical, syntax or semantic errors.

## Optimization notes (added in Phase 9)
- Constant propagation replaces a variable or temporary with its known constant value.
- Constant folding computes operations on constants at compile time.
- Dead code elimination removes unused temporaries and assignments that are overwritten before use.
- The final value of every variable is kept, because it is part of the program's result.
- Integer division truncates toward zero. Folding is skipped for division by zero and for
  integer overflow, so program behavior never changes.
- Every change is recorded as a step with a before/after line and an explanation.

## Educational target code notes (added in Phase 10)
- The target is pseudo-assembly for an imaginary register machine. It is NOT executable machine code.
- Registers are R1, R2, ... (unlimited). Variables are in memory, written [a]. Constants are written #10.
- Each TAC temporary gets one register, in order of first use.
- Opcodes depend on the result type: ADD/FADD, SUB/FSUB, MUL/FMUL, DIV/FDIV, NEG/FNEG, CONCAT, CMPxx.
- Every target line records the TAC instruction it came from.
- Not implemented: register reuse, instruction scheduling, real machine encodings.
