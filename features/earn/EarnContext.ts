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
import { aavePrepareReserveData } from './aave/helpers/aavePrepareReserveData'

export function setupEarnContext({ context$ }: AppContext) {
  const once$ = of(undefined).pipe(shareReplay(1))

  const aaveReserveConfigurationData$ = observe(once$, context$, getAaveReserveConfigurationData)
  const getAaveReserveData$ = observe(once$, context$, getAaveReserveData)
  const getAaveAssetsPrices$ = observe(once$, context$, getAaveAssetsPrices)
  const aaveReserveDataETH$ = getAaveReserveData$({ token: 'ETH' })

  const aaveAvailableLiquidityETH$ = curry(prepareAaveAvailableLiquidityInUSD$('ETH'))(
    aaveReserveDataETH$,
    // @ts-expect-error
    getAaveAssetsPrices$({ tokens: ['USDC'] }), //this needs to be fixed in OasisDEX/transactions -> CallDef
  )

  const aaveSTETHReserveConfigurationData = aaveReserveConfigurationData$({ token: 'STETH' })
  const aavePreparedReserveDataETH$ = curry(aavePrepareReserveData())(aaveReserveDataETH$)

  return {
    aaveSTETHReserveConfigurationData,
    aaveAvailableLiquidityETH$,
    aavePreparedReserveDataETH$,
  }
}

export type EarnContext = ReturnType<typeof setupEarnContext>
