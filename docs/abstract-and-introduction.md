# EduCompiler: abstract and introduction

## Abstract

EduCompiler is a web-based learning system for compiler construction. Students write programs
in EduLang, a small educational language, and the system runs them through a hand-written
compiler pipeline: lexical analysis, syntax analysis, semantic analysis, intermediate code
generation, optimization and educational target code generation. The output of every phase is
shown, including tokens, an abstract syntax tree, a symbol table, three-address code, an
explained optimization log and pseudo-assembly. The system also provides lessons, exercises
with automatic checking, saved programs and compilation history, with student and
administrator roles. It is built with React, Node.js, Express, Prisma and PostgreSQL. The
compiler engine is independent of the web layer and is tested without a server, including a
test that checks that the optimizer does not change program behavior.

## Introduction

Compilers are usually taught with diagrams and with tools that hide the intermediate steps. A
student sees source code go in and a program come out. EduCompiler makes the steps visible and
lets the student change the input and watch every phase react.

## Problem statement

Students find compiler phases abstract because their outputs are invisible in ordinary
compilers. Existing production compilers are too large to read, and diagrams do not react to
the student's own code.

## General objective

Build a working, understandable system that teaches how a compiler works through interactive
inspection of every phase.

## Specific objectives

1. Define a small language (EduLang) with a documented grammar and type rules.
2. Implement a lexer, a recursive-descent parser and a semantic analyzer with clear errors.
3. Generate and display a symbol table and three-address code.
4. Implement safe optimizations and explain each change.
5. Present the target code as educational pseudo-assembly, and say that it is not executable.
6. Provide an editor, visualizations, lessons, exercises, saved programs and history.
7. Protect user data with authentication, role-based authorization and validation.
8. Verify the compiler and the API with automated tests.

## Scope

Included: the EduLang language described in `server/src/compiler/docs/edulang-grammar.md`,
the web application, two roles, and deployment on Vercel, Render and Neon.

## Limitations

- EduLang has no branches, loops, functions or input. Programs are analyzed, never executed.
- Target code is for an imaginary machine and is not executable.
- Accounts have no password reset or email verification.
- Administrators can list and delete students, but not edit them.
- Exercise checking is outcome-based: it inspects the compiler's result for the submission.
- Contrast and accessibility were not formally audited.
