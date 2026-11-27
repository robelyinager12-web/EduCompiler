export interface ExampleProgram {
  id: string;
  title: string;
  source: string;
}

export const EXAMPLES: ExampleProgram[] = [
  {
    id: "basic",
    title: "Variables and print",
    source: `// Declarations and print
int age = 20;
int salary = 5000;
float tax = 2.5;
string name = "Student";

print(age);
print(salary);
print(name);
`,
  },
  {
    id: "optimize",
    title: "Optimization demo",
    source: `// Watch constant folding and propagation
int a = 10;
int b = 20;
int result = a + b * 2;
print(result);
`,
  },
  {
    id: "semantic-error",
    title: "Semantic errors",
    source: `int age = "hello";

print(unknown);
`,
  },
  {
    id: "syntax-error",
    title: "Syntax errors",
    source: `int x = 5
print(x;
`,
  },
  {
    id: "lexical-error",
    title: "Lexical error",
    source: `int y = 3 $ 4;
`,
  },
];
