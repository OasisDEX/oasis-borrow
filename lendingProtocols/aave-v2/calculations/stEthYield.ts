import type { IRiskRatio } from '@oasisdex/dma-library'
import BigNumber from 'bignumber.js'
import type dayjs from 'dayjs'
import type { GraphQLClient } from 'graphql-request'
import { gql } from 'graphql-request'
import type {
  AaveLikeYieldsResponse,
  FilterYieldFieldsType,
} from 'lendingProtocols/aave-like-common/yields'
import { yieldsDateFormat } from 'lendingProtocols/aave-like-common/yields'
import type { Observable } from 'rxjs'
import { isObservable } from 'rxjs'
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
    $include7Days: Boolean!
    $include7DaysOffset: Boolean!
    $include30Days: Boolean!
    $include90Days: Boolean!
    $include90DaysOffset: Boolean!
    $include1Year: Boolean!
    $includeInception: Boolean!
    $reserveAddress: String!
  ) {
    yield7days: aaveYieldRate(
      input: {
        startDate: $date7daysAgo
        endDate: $currentDate
        multiple: $multiply
        reserveAddress: $reserveAddress
      }
    ) @include(if: $include7Days) {
      yield {
        netAnnualisedYield
      }
    }

    yield7daysOffset: aaveYieldRate(
      input: {
        startDate: $date7daysAgoOffset
        endDate: $currentDateOffset
        multiple: $multiply
        reserveAddress: $reserveAddress
      }
    ) @include(if: $include7DaysOffset) {
      yield {
        netAnnualisedYield
      }
    }

    yield30days: aaveYieldRate(
      input: {
        startDate: $date30daysAgo
        endDate: $currentDate
        multiple: $multiply
        reserveAddress: $reserveAddress
      }
    ) @include(if: $include30Days) {
      yield {
        netAnnualisedYield
      }
    }

    yield90days: aaveYieldRate(
      input: {
        startDate: $date90daysAgo
        endDate: $currentDate
        multiple: $multiply
        reserveAddress: $reserveAddress
      }
    ) @include(if: $include90Days) {
      yield {
        netAnnualisedYield
      }
    }

    yield90daysOffset: aaveYieldRate(
      input: {
        startDate: $date90daysAgoOffset
        endDate: $currentDateOffset
        multiple: $multiply
        reserveAddress: $reserveAddress
      }
    ) @include(if: $include90DaysOffset) {
      yield {
        netAnnualisedYield
      }
    }

    yield1year: aaveYieldRate(
      input: {
        startDate: $date1yearAgo
        endDate: $currentDate
        multiple: $multiply
        reserveAddress: $reserveAddress
      }
    ) @include(if: $include1Year) {
      yield {
        netAnnualisedYield
      }
    }
    yieldSinceInception: aaveYieldRate(
      input: {
        startDate: "2020-11-30"
        endDate: $currentDate
        multiple: $multiply
        reserveAddress: $reserveAddress
      }
    ) @include(if: $includeInception) {
      yield {
        netAnnualisedYield
      }
    }
  }
`

export async function getAaveStEthYield(
  client: Observable<GraphQLClient> | GraphQLClient,
  currentDate: dayjs.Dayjs,
  riskRatio: IRiskRatio,
  fields: FilterYieldFieldsType[],
): Promise<AaveLikeYieldsResponse> {
  const currentDateGuarded = currentDate.clone()
  const reserveAddress = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'
  const getClient = isObservable(client) ? await client.pipe(first()).toPromise() : client
  const response = await getClient.request(aaveStEthYield, {
    reserveAddress,
    multiply: riskRatio.multiple.toString(),
    currentDate: currentDateGuarded.clone().format(yieldsDateFormat),
    currentDateOffset: currentDateGuarded.clone().subtract(1, 'days').format(yieldsDateFormat),
    date7daysAgo: currentDateGuarded.clone().subtract(7, 'days').format(yieldsDateFormat),
    date7daysAgoOffset: currentDateGuarded
      .clone()
      .subtract(1, 'days')
      .subtract(7, 'days')
      .format(yieldsDateFormat),
    date30daysAgo: currentDateGuarded.clone().subtract(30, 'days').format(yieldsDateFormat),
    date90daysAgo: currentDateGuarded.clone().subtract(90, 'days').format(yieldsDateFormat),
    date90daysAgoOffset: currentDateGuarded.clone().subtract(90, 'days').format(yieldsDateFormat),
    date1yearAgo: currentDateGuarded.clone().subtract(1, 'year').format(yieldsDateFormat),
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
      response.yield7days?.yield && new BigNumber(response.yield7days.yield.netAnnualisedYield),
    annualisedYield7daysOffset:
      response.yield7daysOffset?.yield &&
      new BigNumber(response.yield7daysOffset.yield.netAnnualisedYield),
    annualisedYield30days:
      response.yield30days?.yield && new BigNumber(response.yield30days.yield.netAnnualisedYield),
    annualisedYield90days:
      response.yield90days?.yield && new BigNumber(response.yield90days.yield.netAnnualisedYield),
    annualisedYield90daysOffset:
      response.yield90daysOffset?.yield &&
      new BigNumber(response.yield90daysOffset.yield.netAnnualisedYield),
    annualisedYield1Year:
      response.yield1year?.yield && new BigNumber(response.yield1year.yield.netAnnualisedYield),
    annualisedYieldSinceInception:
      response.yieldSinceInception?.yield &&
      new BigNumber(response.yieldSinceInception.yield.netAnnualisedYield),
  }
}
