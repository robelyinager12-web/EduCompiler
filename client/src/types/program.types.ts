export interface ProgramSummary {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export interface Program extends ProgramSummary {
  sourceCode: string;
}
