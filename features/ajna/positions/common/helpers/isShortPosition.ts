import { AJNA_SHORT_POSITION_COLLATERALS } from 'features/ajna/common/consts'

interface IsShortPositionParams {
  collateralToken: string
}

export function isShortPosition({ collateralToken }: IsShortPositionParams): boolean {
  return AJNA_SHORT_POSITION_COLLATERALS.includes(collateralToken)
}
