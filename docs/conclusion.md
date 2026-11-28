# Conclusion

EduCompiler meets its main objective: a student can write a program and inspect every phase of
a real, hand-written compiler. The compiler engine is independent of the web layer, which made
it possible to test it directly, including a reference-machine test that compares the behavior
of optimized and unoptimized code on fixed and randomly generated programs.

Testing found a real defect. A long chain such as `1+1+1+...` built a very deep tree without
triggering the existing nesting limit, so a height limit was added.

The project is deliberately small. EduLang has no control flow, the target code is not
executable, and the account system has no password reset. These limits are listed in the README
so they are not mistaken for features.

Natural next steps are `if`/`else` statements (the grammar and reserved words already exist),
a data-flow based optimizer, httpOnly cookie sessions, password reset, and browser
end-to-end tests.
