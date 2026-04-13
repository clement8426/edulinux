export interface ProgressData {
  completedLevels: number[];
  currentLevel: number;
  totalXP: number;
  badges: string[];
  completedScenarios: number[];
  scenarioSteps: Record<string, number>;
}

export interface ValidationResult {
  valid: boolean;
  data: ProgressData | null;
  errors: unknown[];
}

export declare function validateFileSystemPath(baseDir: string, key: string): string | null;
export declare function generatePtyToken(userId: string): string;
export declare function verifyPtyToken(token: unknown): { userId: string } | null;
export declare function validateTerminalSize(cols: unknown, rows: unknown): { cols: number; rows: number };
export declare function generateWorkDir(userId: string, kind: string, id: number | string): string;
export declare function validateProgress(body: unknown): ValidationResult;
export declare const _tokenStore: Map<string, { userId: string; expiry: number }>;
