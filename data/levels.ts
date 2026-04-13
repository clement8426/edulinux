// Re-exports from modular level files in data/levels/
// Each block of 10 levels lives in its own file under data/levels/
export type { Level, FileSystemStructure, ValidationRule } from './levels/index';
export { levels } from './levels/index';

import type { Level } from './levels/_types';

export const getDifficultyEmoji = (difficulty: Level['difficulty']) => {
  switch (difficulty) {
    case 'beginner':
      return '🟢';
    case 'intermediate':
      return '🟡';
    case 'advanced':
      return '🔴';
    default:
      return '⚪';
  }
};
