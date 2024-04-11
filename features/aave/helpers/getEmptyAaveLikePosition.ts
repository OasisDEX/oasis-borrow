import type { AaveLikeTokens } from '@oasisdex/dma-library'
import { AaveLikePosition } from '@oasisdex/dma-library'
import { getToken } from 'blockchain/tokensMetadata'
import { zero } from 'helpers/zero'
import { memoize } from 'lodash'

export const getEmptyAaveLikePosition = memoize(
  ({
    debtToken,
    collateralToken,
    debtTokenAddress,
    collateralTokenAddress,
  }: {
    debtToken: string
    collateralToken: string
    debtTokenAddress?: string
    collateralTokenAddress?: string
  }): AaveLikePosition =>
    new AaveLikePosition(
      {
        amount: zero,
        symbol: debtToken as AaveLikeTokens,
        address: debtTokenAddress || '',
        precision: getToken(debtToken).precision,
      },
      {
        amount: zero,
        symbol: collateralToken as AaveLikeTokens,
        address: collateralTokenAddress || '',
        precision: getToken(collateralToken).precision,
      },
      zero,
      {
        liquidationThreshold: zero,
        maxLoanToValue: zero,
        dustLimit: zero,
      },
    ),
)
