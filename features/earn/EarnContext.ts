import {
  getAaveReserveConfigurationData,
  getAaveReserveData,
} from 'blockchain/calls/aave/aaveProtocolDataProvider'
import { observe } from 'blockchain/calls/observe'
import { AppContext } from 'components/AppContext'
import { memoize } from 'lodash'
import { curry } from 'ramda'
import { of } from 'rxjs'
import { shareReplay } from 'rxjs/operators'

import { createAavePrepareReserveData$ } from '../aave/helpers/aavePrepareReserveData'

export function setupEarnContext({ context$, aaveAvailableLiquidityETH$ }: AppContext) {
  const once$ = of(undefined).pipe(shareReplay(1))

  const aaveReserveConfigurationData$ = memoize(
    observe(once$, context$, getAaveReserveConfigurationData),
    ({ token }) => token,
  )
  const getAaveReserveData$ = observe(once$, context$, getAaveReserveData)

  const aaveSTETHReserveConfigurationData = aaveReserveConfigurationData$({ token: 'STETH' })
  const aaveReserveData$ = memoize(curry(createAavePrepareReserveData$)(getAaveReserveData$))

  return {
    aaveSTETHReserveConfigurationData,
    aaveAvailableLiquidityETH$,
    aaveReserveData$,
  }
}

export type EarnContext = ReturnType<typeof setupEarnContext>
