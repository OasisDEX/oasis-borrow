import { AaveLikeYieldLoopRiskBanner } from 'features/omni-kit/protocols/aave-like/components'
import { isAaveLikeLendingProtocol, LendingProtocol } from 'lendingProtocols'
import React from 'react'

export const getAaveLikeBanner = ({
  protocol,
  isYieldLoopWithData,
  isOpening,
}: {
  protocol: LendingProtocol
  isYieldLoopWithData: boolean
  collateralToken: string
  quoteToken: string
  isOpening: boolean
}) => {
  if (!isAaveLikeLendingProtocol(protocol)) {
    throw Error('Given protocol is not aave-like')
  }

  return {
    [LendingProtocol.AaveV2]: isYieldLoopWithData && isOpening && <AaveLikeYieldLoopRiskBanner />,
    [LendingProtocol.AaveV3]: isYieldLoopWithData && isOpening && <AaveLikeYieldLoopRiskBanner />,
    [LendingProtocol.SparkV3]: null,
  }[protocol]
}
