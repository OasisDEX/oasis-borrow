import { getAaveAssetsPrices } from 'blockchain/calls/aave/aavePriceOracle'
import {
  getAaveReserveConfigurationData,
  getAaveReserveData,
} from 'blockchain/calls/aave/aaveProtocolDataProvider'
import { observe } from 'blockchain/calls/observe'
import { AppContext } from 'components/AppContext'
import { GraphQLClient } from 'graphql-request'
import { memoize } from 'lodash'
import moment from 'moment'
import { curry } from 'ramda'
import { of } from 'rxjs'
import { distinctUntilKeyChanged, map, shareReplay } from 'rxjs/operators'

import { prepareAaveAvailableLiquidityInUSD$ } from './aave/helpers/aavePrepareAvailableLiquidity'
import { getAaveStEthYield } from './aave/open/services'

export function setupEarnContext({ onEveryBlock$, context$ }: AppContext) {
  const once$ = of(undefined).pipe(shareReplay(1))
  const disconnectedGraphQLClient$ = context$.pipe(
    distinctUntilKeyChanged('cacheApi'),
    map(({ cacheApi }) => new GraphQLClient(cacheApi)),
  )

  const aaveReserveConfigurationData$ = observe(once$, context$, getAaveReserveConfigurationData)

  const aaveSthEthYieldsQuery = memoize(
    curry(getAaveStEthYield)(disconnectedGraphQLClient$, moment()),
  )

  const getAaveReserveData$ = observe(onEveryBlock$, context$, getAaveReserveData)
  const getAaveAssetsPrices$ = observe(onEveryBlock$, context$, getAaveAssetsPrices)

  const aaveAvailableLiquidityETH$ = curry(prepareAaveAvailableLiquidityInUSD$('ETH'))(
    getAaveReserveData$({ token: 'ETH' }),
    // @ts-expect-error
    getAaveAssetsPrices$({ tokens: ['USDC'] }), //this needs to be fixed in OasisDEX/transactions -> CallDef
  )

  const aaveReserveConfigurationData = aaveReserveConfigurationData$({ token: 'STETH' })

  return {
    aaveReserveConfigurationData,
    aaveSthEthYieldsQuery,
    aaveAvailableLiquidityETH$,
  }
}

export type EarnContext = ReturnType<typeof setupEarnContext>
