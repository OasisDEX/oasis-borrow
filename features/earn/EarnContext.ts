import {
  getAaveReserveConfigurationData,
  getAaveReserveData,
} from 'blockchain/calls/aave/aaveProtocolDataProvider'
import { observe } from 'blockchain/calls/observe'
import { AppContext } from 'components/AppContext'
import { curry } from 'ramda'
import { of } from 'rxjs'
import { shareReplay } from 'rxjs/operators'

import { aavePrepareReserveData } from '../aave/helpers/aavePrepareReserveData'

export function setupEarnContext({ context$, aaveAvailableLiquidityETH$ }: AppContext) {
  const once$ = of(undefined).pipe(shareReplay(1))

  const aaveReserveConfigurationData$ = observe(once$, context$, getAaveReserveConfigurationData)
  const getAaveReserveData$ = observe(once$, context$, getAaveReserveData)
  const aaveReserveDataETH$ = getAaveReserveData$({ token: 'ETH' })

  const aaveSTETHReserveConfigurationData = aaveReserveConfigurationData$({ token: 'STETH' })
  const aavePreparedReserveDataETH$ = curry(aavePrepareReserveData())(aaveReserveDataETH$)

  return {
    aaveSTETHReserveConfigurationData,
    aaveAvailableLiquidityETH$,
    aavePreparedReserveDataETH$,
  }
}

export type EarnContext = ReturnType<typeof setupEarnContext>
