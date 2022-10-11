import { IRiskRatio } from '@oasisdex/oasis-actions'
import BigNumber from 'bignumber.js'
import { gql, GraphQLClient } from 'graphql-request'
import moment from 'moment/moment'
import { Observable } from 'rxjs'
import { first } from 'rxjs/operators'

export type FilterYieldFieldsType =
  | '7Days'
  | '7DaysOffset'
  | '30Days'
  | '90Days'
  | '90DaysOffset'
  | '1Year'
  | 'Inception'

const yieldsDateFormat = 'YYYY-MM-DD'

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
    $include7Days: Boolean!
    $include7DaysOffset: Boolean!
    $include30Days: Boolean!
    $include90Days: Boolean!
    $include90DaysOffset: Boolean!
    $include1Year: Boolean!
    $includeInception: Boolean!
  ) {
    yield7days: aaveYieldRate(
      input: { startDate: $date7daysAgo, endDate: $currentDate, multiple: $multiply }
    ) @include(if: $include7Days) {
      yield {
        netAnnualisedYield
      }
    }

    yield7daysOffset: aaveYieldRate(
      input: { startDate: $date7daysAgoOffset, endDate: $currentDateOffset, multiple: $multiply }
    ) @include(if: $include7DaysOffset) {
      yield {
        netAnnualisedYield
      }
    }

    yield30days: aaveYieldRate(
      input: { startDate: $date30daysAgo, endDate: $currentDate, multiple: $multiply }
    ) @include(if: $include30Days) {
      yield {
        netAnnualisedYield
      }
    }

    yield90days: aaveYieldRate(
      input: { startDate: $date90daysAgo, endDate: $currentDate, multiple: $multiply }
    ) @include(if: $include90Days) {
      yield {
        netAnnualisedYield
      }
    }

    yield90daysOffset: aaveYieldRate(
      input: { startDate: $date90daysAgoOffset, endDate: $currentDateOffset, multiple: $multiply }
    ) @include(if: $include90DaysOffset) {
      yield {
        netAnnualisedYield
      }
    }

    yield1year: aaveYieldRate(
      input: { startDate: $date1yearAgo, endDate: $currentDate, multiple: $multiply }
    ) @include(if: $include1Year) {
      yield {
        netAnnualisedYield
      }
    }
    yieldSinceInception: aaveYieldRate(
      input: { startDate: "2020-11-30", endDate: $currentDate, multiple: $multiply }
    ) @include(if: $includeInception) {
      yield {
        netAnnualisedYield
      }
    }
  }
`

export interface AaveStEthYieldsResponse {
  annualisedYield7days?: BigNumber
  annualisedYield7daysOffset?: BigNumber
  annualisedYield30days?: BigNumber
  annualisedYield90days?: BigNumber
  annualisedYield90daysOffset?: BigNumber
  annualisedYield1Year?: BigNumber
  annualisedYieldSinceInception?: BigNumber
}

export async function getAaveStEthYield(
  client: Observable<GraphQLClient>,
  currentDate: moment.Moment,
  riskRatio: IRiskRatio,
  fields: FilterYieldFieldsType[],
): Promise<AaveStEthYieldsResponse> {
  const reserveAddress = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'
  const getClient = await client.pipe(first()).toPromise()
  const response = await getClient.request(aaveStEthYield, {
    reserveAddress,
    multiply: riskRatio.multiple.toString(),
    currentDate: currentDate.utc().format(yieldsDateFormat),
    currentDateOffset: currentDate.utc().subtract(1, 'days').format(yieldsDateFormat),
    date7daysAgo: currentDate.utc().clone().subtract(7, 'days').format(yieldsDateFormat),
    date7daysAgoOffset: currentDate
      .utc()
      .clone()
      .subtract(1, 'days')
      .subtract(7, 'days')
      .format(yieldsDateFormat),
    date30daysAgo: currentDate.utc().clone().subtract(30, 'days').format(yieldsDateFormat),
    date90daysAgo: currentDate.utc().clone().subtract(90, 'days').format(yieldsDateFormat),
    date90daysAgoOffset: currentDate.utc().clone().subtract(90, 'days').format(yieldsDateFormat),
    date1yearAgo: currentDate.utc().clone().subtract(1, 'year').format(yieldsDateFormat),
    include7Days: fields.length ? fields.includes('7Days') : true,
    include7DaysOffset: fields.length ? fields.includes('7DaysOffset') : true,
    include30Days: fields.length ? fields.includes('30Days') : true,
    include90Days: fields.length ? fields.includes('90Days') : true,
    include90DaysOffset: fields.length ? fields.includes('90DaysOffset') : true,
    include1Year: fields.length ? fields.includes('1Year') : true,
    includeInception: fields.length ? fields.includes('Inception') : true,
  })
  return {
    annualisedYield7days:
      response.yield7days && new BigNumber(response.yield7days.yield.netAnnualisedYield),
    annualisedYield7daysOffset:
      response.yield7daysOffset &&
      new BigNumber(response.yield7daysOffset.yield.netAnnualisedYield),
    annualisedYield30days:
      response.yield30days && new BigNumber(response.yield30days.yield.netAnnualisedYield),
    annualisedYield90days:
      response.yield90days && new BigNumber(response.yield90days.yield.netAnnualisedYield),
    annualisedYield90daysOffset:
      response.yield90daysOffset &&
      new BigNumber(response.yield90daysOffset.yield.netAnnualisedYield),
    annualisedYield1Year:
      response.yield1year && new BigNumber(response.yield1year.yield.netAnnualisedYield),
    annualisedYieldSinceInception:
      response.yieldSinceInception &&
      new BigNumber(response.yieldSinceInception.yield.netAnnualisedYield),
  }
}
