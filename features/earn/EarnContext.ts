import { getAaveAssetsPrices } from 'blockchain/calls/aave/aavePriceOracle'
import {
  getAaveReserveConfigurationData,
  getAaveReserveData,
} from 'blockchain/calls/aave/aaveProtocolDataProvider'
import { observe } from 'blockchain/calls/observe'
import { AppContext } from 'components/AppContext'
import { curry } from 'ramda'
import { of } from 'rxjs'
import { shareReplay } from 'rxjs/operators'

import { prepareAaveAvailableLiquidityInUSD$ } from './aave/helpers/aavePrepareAvailableLiquidity'

export function setupEarnContext({ context$ }: AppContext) {
  const once$ = of(undefined).pipe(shareReplay(1))

  const aaveReserveConfigurationData$ = observe(once$, context$, getAaveReserveConfigurationData)
  const getAaveReserveData$ = observe(once$, context$, getAaveReserveData)
  const getAaveAssetsPrices$ = observe(once$, context$, getAaveAssetsPrices)

  const aaveAvailableLiquidityETH$ = curry(prepareAaveAvailableLiquidityInUSD$('ETH'))(
    getAaveReserveData$({ token: 'ETH' }),
    // @ts-expect-error
    getAaveAssetsPrices$({ tokens: ['USDC'] }), //this needs to be fixed in OasisDEX/transactions -> CallDef
  )

  const aaveReserveConfigurationData = aaveReserveConfigurationData$({ token: 'STETH' })

  return {
    aaveReserveConfigurationData,
    aaveAvailableLiquidityETH$,
  }
}

export type EarnContext = ReturnType<typeof setupEarnContext>
