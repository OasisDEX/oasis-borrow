import BigNumber from 'bignumber.js'
import { gql, GraphQLClient } from 'graphql-request'
import moment from 'moment/moment'
import { Observable } from 'rxjs'
import { first } from 'rxjs/operators'

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
    yieldSinceInception: aaveYieldRateStethEth(
      input: { startDate: "2020-11-30", endDate: $currentDate, multiple: $multiply }
    ) {
      yield {
        netAnnualisedYield
      }
    }
  }
`

export interface AaveStEthYieldsResponse {
  annualisedYield30days: BigNumber
  annualisedYield90days: BigNumber
  annualisedYield1Year: BigNumber
  annualisedYieldSinceInception: BigNumber
}

export async function getAaveStEthYield(
  client: Observable<GraphQLClient>,
  currentDate: moment.Moment,
  multiply: BigNumber,
): Promise<AaveStEthYieldsResponse> {
  const getClient = await client.pipe(first()).toPromise()
  const response = await getClient.request(aaveStEthYield, {
    currentDate: currentDate.utc().format('YYYY-MM-DD'),
    date30daysAgo: currentDate.utc().clone().subtract(30, 'days').format('YYYY-MM-DD'),
    date90daysAgo: currentDate.utc().clone().subtract(90, 'days').format('YYYY-MM-DD'),
    date1yearAgo: currentDate.utc().clone().subtract(1, 'year').format('YYYY-MM-DD'),
    multiply: multiply.toString(),
  })
  return {
    annualisedYield30days: new BigNumber(response.yield30days.yield.netAnnualisedYield),
    annualisedYield90days: new BigNumber(response.yield90days.yield.netAnnualisedYield),
    annualisedYield1Year: new BigNumber(response.yield1year.yield.netAnnualisedYield),
    annualisedYieldSinceInception: new BigNumber(
      response.yieldSinceInception.yield.netAnnualisedYield,
    ),
  }
}
