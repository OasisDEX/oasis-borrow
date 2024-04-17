import { ADDRESS_ZERO } from '@oasisdex/addresses'
import type { MorphoVauldIdPositionsResponse, PositionFromUrl } from 'features/omni-kit/observables'
import {
  morphoMarkets,
  settings as morphoSettings,
} from 'features/omni-kit/protocols/morpho-blue/settings'
import type { OmniSupportedNetworkIds } from 'features/omni-kit/types'

interface GetMorphoPositionWithPairIdParams {
  networkId: OmniSupportedNetworkIds
  position: PositionFromUrl
  response: MorphoVauldIdPositionsResponse
  pairId: number
}

// DO NOT USE UNTIL ISSUE WITH CONDITION BELOW WILL BE FIXED
export function getMorphoPositionWithPairId({
  networkId,
  position,
  response,
  pairId,
}: GetMorphoPositionWithPairIdParams) {
  return {
    ...position,
    pairId:
      position.protocolRaw === morphoSettings.rawName[networkId]
        ? Math.max(
            (morphoMarkets[networkId]?.[
              `${position.collateralTokenSymbol}-${position.debtTokenSymbol}`
            ]?.indexOf(
              response.accounts?.[0]?.borrowPositions.find(
                ({ market: { collateralToken, debtToken } }) =>
                  // this condition is not enough to pick up the correct market id
                  // it fails when user has 2 or more positions with the same pair but on different market
                  // since find method resolves with first matching item
                  collateralToken.address === position.collateralTokenAddress &&
                  debtToken.address === position.debtTokenAddress,
              )?.market.id ?? ADDRESS_ZERO,
            ) ?? 0) + 1,
            1,
          )
        : pairId,
  }
}
