import type { DataType } from "../ast/nodes";

export type SymbolValue = number | string | boolean | null;

export interface SymbolEntry {
  name: string;
  type: DataType;
  value: SymbolValue; // constant initializer, or null when unknown
  scope: string;
  line: number;
  initialized: boolean;
}

interface Scope {
  name: string;
  symbols: Map<string, SymbolEntry>;
}

export class SymbolTable {
  private readonly scopes: Scope[] = [{ name: "global", symbols: new Map() }];
  private readonly all: SymbolEntry[] = [];
  private blockCounter = 0;

  enterScope(name?: string): void {
    this.blockCounter++;
    this.scopes.push({ name: name ?? `block${this.blockCounter}`, symbols: new Map() });
  }

  exitScope(): void {
    // The global scope can never be removed.
    if (this.scopes.length > 1) this.scopes.pop();
  }

  // Returns false if the name already exists in the CURRENT scope.
  declare(entry: Omit<SymbolEntry, "scope">): boolean {
    const scope = this.scopes[this.scopes.length - 1];
    if (scope.symbols.has(entry.name)) return false;

    const full: SymbolEntry = { ...entry, scope: scope.name };
    scope.symbols.set(entry.name, full);
    this.all.push(full);
    return true;
  }

  // Searches from the innermost scope outwards.
  lookup(name: string): SymbolEntry | undefined {
    for (let i = this.scopes.length - 1; i >= 0; i--) {
      const found = this.scopes[i].symbols.get(name);
      if (found) return found;
    }
    return undefined;
  }

  // A plain-data copy, safe to store in a Json column or send to the browser.
  entries(): SymbolEntry[] {
    return this.all.map((entry) => ({ ...entry }));
  }
}
