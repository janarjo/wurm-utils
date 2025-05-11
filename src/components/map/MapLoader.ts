const mapImages = import.meta.glob('/src/assets/maps/*.png', { eager: true, as: 'url' })

export function getMapImage(imageName: string): string {
  return mapImages[`/src/assets/maps/${imageName}.png`] as string
}
