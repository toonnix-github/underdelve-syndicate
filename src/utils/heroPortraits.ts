const heroPortraitModules = import.meta.glob('../../assets/hero_*.png', {
    eager: true,
    import: 'default'
}) as Record<string, string>;

const heroPortraits = Object.fromEntries(
    Object.entries(heroPortraitModules).map(([path, url]) => {
        const fileName = path.split('/').pop()?.replace('.png', '') ?? '';
        return [fileName, url];
    })
) as Record<string, string>;

export const getHeroPortraitUrl = (imageId: string) => {
    return heroPortraits[imageId] ?? `/assets/${imageId}.png`;
};
