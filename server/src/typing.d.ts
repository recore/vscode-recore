declare module 'eslint' {
  export interface ESLintError {
    ruleId: string;
    severity: number;
    message: string;
    line: number;
    column: number;
    nodeType: string;
    source: string;
    endLine?: number;
    endColumn?: number;
  }
  export interface Report {
    results: {
      messages: ESLintError[];
    }[];
  }
  export class CLIEngine {
    constructor(config: any);
    executeOnText(text: string, filename: string): Report;
  }
}

declare module '*.json';

declare module '@ali/my-prettier';
