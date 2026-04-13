export interface Level {
  id: number;
  title: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  objective: string;
  description: string;
  commands: string[];
  hints: string[];
  fileSystem: FileSystemStructure;
  validation: ValidationRule[];
  story?: string;
}

export interface FileSystemStructure {
  [key: string]: string | FileSystemStructure;
}

export interface ValidationRule {
  type: 'command' | 'output' | 'fileContent' | 'fileExists';
  value: string;
  description?: string;
}
