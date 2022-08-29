import BigNumber from 'bignumber.js'
import { gql, GraphQLClient } from 'graphql-request'
import moment from 'moment/moment'

const aaveStEthYield = gql`
  mutation stEthYields(
    $currentDate: Date!
    $date30daysAgo: Date!
    $date90daysAgo: Date!
    $date1yearAgo: Date!
    $multiply: BigFloat!
  ) {
    yield30days: aaveYieldRateStethEth(
      input: { startDate: $date30daysAgo, endDate: $currentDate, multiple: $multiply }
    ) {
      yield {
        netAnnualisedYield
      }
    }

    yield90days: aaveYieldRateStethEth(
      input: { startDate: $date90daysAgo, endDate: $currentDate, multiple: $multiply }
    ) {
      yield {
        netAnnualisedYield
      }
    }

    yield1year: aaveYieldRateStethEth(
      input: { startDate: $date1yearAgo, endDate: $currentDate, multiple: $multiply }
    ) {
      yield {
        netAnnualisedYield
      }
    }
  }
`

export interface AaveStEthYieldsResponse {
  annualised30Yield: BigNumber
  annualised90Yield: BigNumber
  annualised1Yield: BigNumber
}

export async function getAaveStEthYield(
  client: GraphQLClient,
  currentDate: moment.Moment,
  multiply: BigNumber,
): Promise<AaveStEthYieldsResponse> {
  const response = await client.request(aaveStEthYield, {
    currentDate: currentDate.format('YYYY-MM-DD'),
    date30daysAgo: currentDate.clone().subtract(30, 'days').format('YYYY-MM-DD'),
    date90daysAgo: currentDate.clone().subtract(90, 'days').format('YYYY-MM-DD'),
    date1yearAgo: currentDate.clone().subtract(1, 'year').format('YYYY-MM-DD'),
    multiply: multiply.toString(),
  })

  return {
    annualised30Yield: new BigNumber(response.yield30days.yield.netAnnualisedYield),
    annualised90Yield: new BigNumber(response.yield90days.yield.netAnnualisedYield),
    annualised1Yield: new BigNumber(response.yield1year.yield.netAnnualisedYield),
  }
}

// export function createStEthYields$(
//   context$: Observable<Context>,
//   currentDate: moment.Moment,
//   multiply: BigNumber,
// ): Observable<aaveStEthYieldsResponse> {
//   return context$.pipe(
//     switchMap(({ cacheApi }) => {
//       const apiClient = new GraphQLClient(cacheApi)
//       return getAaveStEthYield(apiClient, currentDate, multiply)
//     }),
//     shareReplay(1),
//   )
// }
