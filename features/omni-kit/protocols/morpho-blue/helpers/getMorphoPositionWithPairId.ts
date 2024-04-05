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
                  collateralToken.address === position.collateralTokenAddress &&
                  debtToken.address === position.debtTokenAddress,
              )?.market.id ?? ADDRESS_ZERO,
            ) ?? 0) + 1,
            1,
          )
        : pairId,
  }
}
