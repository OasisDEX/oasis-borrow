import type { AaveLikeTokens } from '@oasisdex/dma-library'
import { AaveLikePosition } from '@oasisdex/dma-library'
import type { IStrategyConfig } from 'features/aave/types'
import type { OmniProtocolHookProps } from 'features/omni-kit/types'
import { zero } from 'helpers/zero'

export function useAaveLikeSimpleEarnData({ strategy }: { strategy: IStrategyConfig }) {
  return function ({
    dpmPositionData: _dpmPositionData,
    networkId: _networkId,
    tokenPriceUSDData: _tokenPriceUSDData,
    tokensPrecision: _tokensPrecision,
  }: OmniProtocolHookProps) {
    const aggregatedData = {
      auction: {},
      history: [],
    }
    const positionData = new AaveLikePosition(
      { amount: zero, symbol: strategy.tokens.debt as AaveLikeTokens, address: '' },
      {
        amount: zero,
        symbol: strategy.tokens.collateral as AaveLikeTokens,
        address: '',
      },
      zero,
      {
        liquidationThreshold: zero,
        maxLoanToValue: zero,
        dustLimit: zero,
      },
    )
    return {
      data: {
        aggregatedData,
        positionData,
      },
      errors: [],
    }
  }
}
