import { describe, expect, it } from 'vitest';
import { getHeroPortraitUrl } from '../../src/utils/heroPortraits';

describe('heroPortraits utility', () => {
  it('returns fallback path for unknown portrait id', () => {
    expect(getHeroPortraitUrl('hero_missing')).toBe('/assets/hero_missing.png');
  });

  it('returns a resolved string path for known portrait id', () => {
    const url = getHeroPortraitUrl('hero_valerius');
    expect(typeof url).toBe('string');
    expect(url.length).toBeGreaterThan(0);
  });
});
