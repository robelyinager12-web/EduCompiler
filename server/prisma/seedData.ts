export const lessons = [
  {
    title: "What is a compiler?",
    description: "The big picture of how source code becomes a program.",
    content:
      "A compiler translates source code written by a human into another form, such as machine code. It works in phases: lexical analysis, syntax analysis, semantic analysis, intermediate code, optimization and code generation. Each phase takes the output of the previous one and either passes a result on or reports errors.",
    category: "Introduction",
    difficulty: "BEGINNER" as const,
  },
  {
    title: "Lexical analysis and tokens",
    description: "How the lexer turns characters into tokens.",
    content:
      "The lexer reads source code character by character and groups characters into tokens such as keywords, identifiers, numbers and operators. It ignores whitespace and comments.\n\nExample: the text  int age = 20;  becomes the tokens KEYWORD(int), IDENTIFIER(age), ASSIGNMENT_OPERATOR(=), INTEGER_LITERAL(20), SEMICOLON.\n\nLexical errors are invalid characters, such as $ in EduLang, and unterminated strings.",
    category: "Lexical Analysis",
    difficulty: "BEGINNER" as const,
  },
  {
    title: "Syntax analysis and the AST",
    description: "How a parser checks grammar and builds a tree.",
    content:
      "The parser checks that tokens follow the grammar of the language. EduLang uses a recursive-descent parser: each grammar rule is one function.\n\nThe result is an Abstract Syntax Tree (AST). Operator precedence shapes the tree: in 1 + 2 * 3 the multiplication sits below the addition, so it is evaluated first.\n\nSyntax errors are missing semicolons, missing parentheses and missing expressions. After an error the parser skips to the next statement, so one run can report several errors.",
    category: "Syntax Analysis",
    difficulty: "BEGINNER" as const,
  },
  {
    title: "Semantic analysis and the symbol table",
    description: "Checking that a program makes sense.",
    content:
      "A program can have the right shape and still be wrong. The semantic analyzer checks meaning: variables must be declared before use, a name can be declared once per scope, and types must be compatible.\n\nThe symbol table records every declared name with its type, value, scope and line.\n\nExample: int age = \"hello\"; is valid grammar, but a STRING cannot be assigned to an INT. EduLang allows int to float widening, but not float to int.",
    category: "Semantic Analysis",
    difficulty: "INTERMEDIATE" as const,
  },
  {
    title: "Intermediate code and optimization",
    description: "Three-address code, folding, propagation and dead code.",
    content:
      "Three-address code (TAC) breaks a program into simple steps with at most one operation each: t3 = a + b. Temporaries (t1, t2...) hold intermediate results.\n\nThe optimizer rewrites TAC without changing behavior:\n- Constant propagation replaces a variable with its known constant value.\n- Constant folding computes constant expressions at compile time: 10 + 20 becomes 30.\n- Dead code elimination removes values that are never used, such as an assignment that is overwritten before it is read.\n\nA safe optimizer never folds a division by zero and never changes integer overflow behavior.",
    category: "Optimization",
    difficulty: "INTERMEDIATE" as const,
  },
];

export interface SeedExercise {
  title: string;
  description: string;
  instructions: string;
  starterCode: string;
  expectedConcept: string;
  difficulty: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  // Used by tests only. It is never stored in the database.
  solution: string;
}

export const exercises: SeedExercise[] = [
  {
    title: "Fix the type error",
    description: "Make a program with a type mismatch compile.",
    instructions:
      "The program does not compile because a string is assigned to an int variable.\nChange it so it compiles without errors, then press Submit.",
    starterCode: 'int age = "hello";\nprint(age);',
    expectedConcept: "compiles",
    difficulty: "BEGINNER",
    solution: "int age = 20;\nprint(age);",
  },
  {
    title: "Declare before you use",
    description: "Fix a program that uses a variable too early.",
    instructions: "A variable must be declared before it is used. Fix the order so the program compiles.",
    starterCode: "print(total);\nint total = 5;",
    expectedConcept: "compiles",
    difficulty: "BEGINNER",
    solution: "int total = 5;\nprint(total);",
  },
  {
    title: "Fix the missing semicolon",
    description: "Repair a syntax error.",
    instructions: "The parser reports a syntax error. Find it and fix it so the program compiles.",
    starterCode: "int x = 5\nprint(x);",
    expectedConcept: "compiles",
    difficulty: "BEGINNER",
    solution: "int x = 5;\nprint(x);",
  },
  {
    title: "Cause a lexical error",
    description: "Write a program the lexer rejects.",
    instructions:
      "Edit the program so that the compiler fails in the lexical phase. Check the Overview tab to see which phase failed.",
    starterCode: "int a = 1;\nprint(a);",
    expectedConcept: "error:lexical",
    difficulty: "BEGINNER",
    solution: "int a = 1 $ 2;",
  },
  {
    title: "Cause a type mismatch",
    description: "Write an incompatible assignment.",
    instructions: "Change the program so the semantic analyzer reports an incompatible assignment.",
    starterCode: "int a = 1;",
    expectedConcept: "error:type-mismatch",
    difficulty: "BEGINNER",
    solution: 'int a = "text";',
  },
  {
    title: "Declare a variable twice",
    description: "Trigger a duplicate declaration error.",
    instructions: "Write a program that declares the same variable name twice.",
    starterCode: "int a = 1;",
    expectedConcept: "error:duplicate-declaration",
    difficulty: "BEGINNER",
    solution: "int a = 1;\nint a = 2;",
  },
  {
    title: "Divide by zero",
    description: "Trigger the division by zero check.",
    instructions: "Change the program so the compiler reports a division by zero.",
    starterCode: "int a = 10;\nprint(a);",
    expectedConcept: "error:division-by-zero",
    difficulty: "INTERMEDIATE",
    solution: "int a = 10 / 0;",
  },
  {
    title: "Use a variable before assigning it",
    description: "Produce a warning instead of an error.",
    instructions:
      "Write a program that compiles, but uses a variable that was declared and never assigned. Warnings do not stop compilation.",
    starterCode: "int x = 1;\nprint(x);",
    expectedConcept: "warning:uninitialized",
    difficulty: "INTERMEDIATE",
    solution: "int x;\nprint(x);",
  },
  {
    title: "Make the optimizer fold a constant",
    description: "See constant folding in action.",
    instructions:
      "Change the program so the optimizer folds a constant expression. Open the Optimized tab to see the step.",
    starterCode: "int a = 1;\nprint(a);",
    expectedConcept: "optimizes:constant-folding",
    difficulty: "INTERMEDIATE",
    solution: "int a = 2 + 3;\nprint(a);",
  },
  {
    title: "Create dead code",
    description: "Make the optimizer remove an assignment.",
    instructions:
      "Change the program so one variable is assigned twice and the first value is never used. The optimizer should remove the first assignment.",
    starterCode: "int x = 1;\nprint(x);",
    expectedConcept: "optimizes:dead-code-elimination",
    difficulty: "ADVANCED",
    solution: "int x = 1;\nx = 2;\nprint(x);",
  },
];
