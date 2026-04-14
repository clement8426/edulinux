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

export interface FileEntry {
  content: string;
  /** Permissions octal (ex: 0o000 pour illisible, 0o755 pour exécutable) */
  mode: number;
}

export interface FileSystemStructure {
  [key: string]: string | FileEntry | FileSystemStructure;
}

export interface ValidationRule {
  type: 'command' | 'output' | 'fileContent' | 'fileExists';
  value: string;
  description?: string;
}
