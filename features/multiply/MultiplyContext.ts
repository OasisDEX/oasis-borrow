import { getAaveReserveConfigurationData } from 'blockchain/calls/aave/aaveProtocolDataProvider'
import { observe } from 'blockchain/calls/observe'
import { AppContext } from 'components/AppContext'
import { prepareAaveAvailableLiquidityInUSDC$ } from 'features/aave/helpers/aavePrepareAvailableLiquidity'
import { curry } from 'ramda'
import { of } from 'rxjs'
import { shareReplay } from 'rxjs/operators'

export function setupMultiplyContext({
  context$,
  getAaveReserveData$,
  getAaveAssetsPrices$,
  wrappedGetAaveReserveData$,
}: AppContext) {
  const once$ = of(undefined).pipe(shareReplay(1))
  const aaveReserveConfigurationData$ = observe(once$, context$, getAaveReserveConfigurationData)

  const aaveAvailableLiquidityInUSDC$ = curry(prepareAaveAvailableLiquidityInUSDC$)(
    getAaveReserveData$,
    // @ts-expect-error
    getAaveAssetsPrices$({ tokens: ['USDC'] }), //this needs to be fixed in OasisDEX/transactions -> CallDef
  )

  return {
    aaveReserveConfigurationData$,
    aaveAvailableLiquidityInUSDC$,
    wrappedGetAaveReserveData$,
  }
}

export type MultiplyContext = ReturnType<typeof setupMultiplyContext>
