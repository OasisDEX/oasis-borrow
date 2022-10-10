import { IRiskRatio } from '@oasisdex/oasis-actions'
import BigNumber from 'bignumber.js'
import { gql, GraphQLClient } from 'graphql-request'
import moment from 'moment/moment'
import { Observable } from 'rxjs'
import { first } from 'rxjs/operators'

const aaveStEthYield = gql`
  mutation stEthYields(
    $currentDate: Date!
    $currentDateOffset: Date!
    $date7daysAgo: Date!
    $date7daysAgoOffset: Date!
    $date30daysAgo: Date!
    $date90daysAgo: Date!
    $date90daysAgoOffset: Date!
    $date1yearAgo: Date!
    $multiply: BigFloat!
  ) {
    yield7days: aaveYieldRate(
      input: { startDate: $date7daysAgo, endDate: $currentDate, multiple: $multiply }
    ) {
      yield {
        netAnnualisedYield
      }
    }

    yield7daysOffset: aaveYieldRate(
      input: { startDate: $date7daysAgoOffset, endDate: $currentDateOffset, multiple: $multiply }
    ) {
      yield {
        netAnnualisedYield
      }
    }

    yield30days: aaveYieldRate(
      input: { startDate: $date30daysAgo, endDate: $currentDate, multiple: $multiply }
    ) {
      yield {
        netAnnualisedYield
      }
    }

    yield90days: aaveYieldRate(
      input: { startDate: $date90daysAgo, endDate: $currentDate, multiple: $multiply }
    ) {
      yield {
        netAnnualisedYield
      }
    }

    yield90daysOffset: aaveYieldRate(
      input: { startDate: $date90daysAgoOffset, endDate: $currentDateOffset, multiple: $multiply }
    ) {
      yield {
        netAnnualisedYield
      }
    }

    yield1year: aaveYieldRate(
      input: { startDate: $date1yearAgo, endDate: $currentDate, multiple: $multiply }
    ) {
      yield {
        netAnnualisedYield
      }
    }
    yieldSinceInception: aaveYieldRate(
      input: { startDate: "2020-11-30", endDate: $currentDate, multiple: $multiply }
    ) {
      yield {
        netAnnualisedYield
      }
    }
  }
`

export interface AaveStEthYieldsResponse {
  annualisedYield7days: BigNumber
  annualisedYield7daysOffset: BigNumber
  annualisedYield30days: BigNumber
  annualisedYield90days: BigNumber
  annualisedYield90daysOffset: BigNumber
  annualisedYield1Year: BigNumber
  annualisedYieldSinceInception: BigNumber
}

export async function getAaveStEthYield(
  client: Observable<GraphQLClient>,
  currentDate: moment.Moment,
  riskRatio: IRiskRatio,
): Promise<AaveStEthYieldsResponse> {
  const reserveAddress = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'
  const getClient = await client.pipe(first()).toPromise()
  const response = await getClient.request(aaveStEthYield, {
    currentDate: currentDate.utc().format('YYYY-MM-DD'),
    currentDateOffset: currentDate.utc().subtract(1, 'days').format('YYYY-MM-DD'),
    date7daysAgo: currentDate.utc().clone().subtract(7, 'days').format('YYYY-MM-DD'),
    date7daysAgoOffset: currentDate
      .utc()
      .clone()
      .subtract(1, 'days')
      .subtract(7, 'days')
      .format('YYYY-MM-DD'),
    date30daysAgo: currentDate.utc().clone().subtract(30, 'days').format('YYYY-MM-DD'),
    date90daysAgo: currentDate.utc().clone().subtract(90, 'days').format('YYYY-MM-DD'),
    date90daysAgoOffset: currentDate.utc().clone().subtract(90, 'days').format('YYYY-MM-DD'),
    date1yearAgo: currentDate.utc().clone().subtract(1, 'year').format('YYYY-MM-DD'),
    multiply: riskRatio.multiple.toString(),
    reserveAddress,
  })
  return {
    annualisedYield7days: new BigNumber(response.yield7days.yield.netAnnualisedYield),
    annualisedYield7daysOffset: new BigNumber(response.yield7daysOffset.yield.netAnnualisedYield),
    annualisedYield30days: new BigNumber(response.yield30days.yield.netAnnualisedYield),
    annualisedYield90days: new BigNumber(response.yield90days.yield.netAnnualisedYield),
    annualisedYield90daysOffset: new BigNumber(response.yield90daysOffset.yield.netAnnualisedYield),
    annualisedYield1Year: new BigNumber(response.yield1year.yield.netAnnualisedYield),
    annualisedYieldSinceInception: new BigNumber(
      response.yieldSinceInception.yield.netAnnualisedYield,
    ),
  }
}
