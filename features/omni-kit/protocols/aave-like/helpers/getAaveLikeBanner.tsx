import { SparkTokensBannerController } from 'features/aave/components/SparkTokensBannerController'
import { checkElligibleSparkPosition } from 'features/aave/helpers/eligible-spark-position'
import { AaveLikeYieldLoopRiskBanner } from 'features/omni-kit/protocols/aave-like/components'
import { isAaveLikeLendingProtocol, LendingProtocol } from 'lendingProtocols'
import React from 'react'

export const getAaveLikeBanner = ({
  protocol,
  isYieldLoop,
  collateralToken,
  quoteToken,
}: {
  protocol: LendingProtocol
  isYieldLoop: boolean
  collateralToken: string
  quoteToken: string
}) => {
  if (!isAaveLikeLendingProtocol(protocol)) {
    throw Error('Given protocol is not aave-like')
  }

  const isSparkPosition = protocol === LendingProtocol.SparkV3
  const isElligibleSparkPosition = checkElligibleSparkPosition(collateralToken, quoteToken)

  return {
    [LendingProtocol.AaveV2]: isYieldLoop && <AaveLikeYieldLoopRiskBanner />,
    [LendingProtocol.AaveV3]: isYieldLoop && <AaveLikeYieldLoopRiskBanner />,
    [LendingProtocol.SparkV3]: isSparkPosition && isElligibleSparkPosition && (
      <SparkTokensBannerController />
    ),
  }[protocol]
}
