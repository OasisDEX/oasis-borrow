import { BigNumber } from 'bignumber.js'
import { OraclePriceData, OraclePriceDataArgs } from 'blockchain/prices'
import { createPriceInfo$, PriceInfo } from 'features/shared/priceInfo'
import { lastHour, nextHour } from 'helpers/time'
import { Observable, of } from 'rxjs'

export interface MockPriceInfoProps {
  _oraclePriceData$?: Observable<OraclePriceData>
  collateralPrice?: BigNumber
  ethPrice?: BigNumber
  isStatic?: boolean
  collateralChangePercentage?: BigNumber // changes next price
  ethChangePercentage?: BigNumber
  token?: string
}

const defaultCollateralPrice = new BigNumber('550')
const defaultEthPrice = new BigNumber('1350')
const defaultIsStatic = false
const defaultCollateralChangePercentage = new BigNumber('0.1')
const defaultEthChangePercentage = new BigNumber('0.0221')
const defaultToken = 'WBTC'

export function mockPriceInfo$({
  _oraclePriceData$,
  collateralPrice = defaultCollateralPrice,
  ethPrice = defaultEthPrice,
  isStatic = defaultIsStatic,
  collateralChangePercentage = defaultCollateralChangePercentage,
  ethChangePercentage = defaultEthChangePercentage,
  token = defaultToken,
}: MockPriceInfoProps = {}): Observable<PriceInfo> {
  const nextEthPrice = ethPrice.plus(ethPrice.times(ethChangePercentage))
  const nextCollateralPrice = collateralPrice.plus(
    collateralPrice.times(collateralChangePercentage),
  )
  const ethPriceInfo$ = of({
    currentPrice: ethPrice,
    isStaticPrice: false,
    nextPrice: nextEthPrice || ethPrice,
    currentPriceUpdate: lastHour,
    nextPriceUpdate: nextHour,
    percentageChange: ethChangePercentage,
  })
  const collateralPriceInfo$ = of({
    currentPrice: collateralPrice,
    isStaticPrice: isStatic,
    nextPrice: nextCollateralPrice || collateralPrice,
    percentageChange: collateralChangePercentage,
    ...(!isStatic && {
      currentPriceUpdate: lastHour,
      nextPriceUpdate: nextHour,
    }),
  })

  function oraclePriceData$({ token }: OraclePriceDataArgs) {
    return _oraclePriceData$ || token === 'ETH' ? ethPriceInfo$ : collateralPriceInfo$
  }
  return createPriceInfo$(oraclePriceData$, token)
}
