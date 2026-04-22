import { describe, expect, it } from 'vitest';
import { cn } from '../../src/components/UI';

describe('UI utility cn', () => {
  it('merges class names and keeps latest Tailwind conflict winner', () => {
    const result = cn('text-red-500', 'p-2', false && 'hidden', 'text-blue-500');
    expect(result.includes('p-2')).toBe(true);
    expect(result.includes('text-blue-500')).toBe(true);
    expect(result.includes('text-red-500')).toBe(false);
  });
});
