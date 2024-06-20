/**
 * @remarks
 * This method is simplified since next protocol bonus depends not only on current user protocols
 * (i.e. if user has position on maker, and morpho, and he opens new one on morpho, next protocol bonus shouldn't be applied)
 * but also on position net value of each position needs to be above 5k USD net to be eligible for protocol bonus
 * This method verifies only whether new position net value is > 5k USD
 *
 * @param currentMultiplier - current protocol boost
 * @param netValue - net value USD of position being created
 *
 * @returns simplified next protocol bonus which doesn't take into account net value of existing positions on different protocols (TBD)
 */

export const getRaysNextProtocolBonus = (currentMultiplier: number, netValue: number) => {
  if (netValue < 5000) {
    return currentMultiplier
  }

  switch (true) {
    case currentMultiplier >= 2:
      return 3
    case currentMultiplier >= 1.5:
      return 2
    case currentMultiplier >= 1.2:
      return 1.5
    case currentMultiplier >= 1:
      return 1.2
    default:
      return 1
  }
}
