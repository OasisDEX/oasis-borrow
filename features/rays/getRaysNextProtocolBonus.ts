export const getRaysNextProtocolBonus = (currentMultiplier: number) => {
  switch (true) {
    case currentMultiplier >= 2:
      return 3
    case currentMultiplier >= 1.5:
      return 2
    case currentMultiplier >= 1.2:
      return 1.5
    case currentMultiplier > 1:
      return 1.2
    default:
      return 1
  }
}
