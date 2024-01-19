import type { AaveLikeTokens } from '@oasisdex/dma-library'
import { AaveLikePosition } from '@oasisdex/dma-library'
import { useProductContext } from 'components/context/ProductContextProvider'
import type { IStrategyConfig } from 'features/aave/types'
import type { AaveSimpleSupplyPosition } from 'features/omni-kit/protocols/aave-like/types/AaveSimpleSupply'
import type { OmniProtocolHookProps } from 'features/omni-kit/types'
import { useObservable } from 'helpers/observableHook'
import { zero } from 'helpers/zero'
import { useMemo } from 'react'
import { EMPTY } from 'rxjs'

export function useAaveLikeSimpleEarnData({ strategy }: { strategy: IStrategyConfig }) {
  return function ({
    dpmPositionData,
    networkId,
    tokenPriceUSDData,
    tokensPrecision,
  }: OmniProtocolHookProps) {
    const aggregatedData = {
      auction: {},
      history: [],
    }
    const { morphoPosition$ } = useProductContext()
    console.log('useAaveLikeSimpleEarnData', {
      dpmPositionData,
      networkId,
      tokenPriceUSDData,
      tokensPrecision,
    })
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
    ) as unknown as AaveSimpleSupplyPosition

    const [aaveLikePositionData, aaveLikePositionError] = useObservable(
      useMemo(
        () =>
          dpmPositionData && tokenPriceUSDData
            ? morphoPosition$(
                tokenPriceUSDData[dpmPositionData.collateralToken],
                tokenPriceUSDData[dpmPositionData.quoteToken],
                dpmPositionData,
                networkId,
                tokensPrecision,
              )
            : EMPTY,
        [dpmPositionData, tokenPriceUSDData],
      ),
    )
    console.log(
      'aaveLikePositionData, aaveLikePositionError',
      aaveLikePositionData,
      aaveLikePositionError,
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
