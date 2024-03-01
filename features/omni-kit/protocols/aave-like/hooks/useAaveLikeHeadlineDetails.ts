import type { IRiskRatio } from '@oasisdex/dma-library'
import { RiskRatio } from '@oasisdex/dma-library'
import BigNumber from 'bignumber.js'
import type { NetworkNames } from 'blockchain/networks'
import { useAaveEarnYields, useAaveTvl } from 'features/aave/hooks'
import { useOmniYieldLoopHeadline } from 'features/omni-kit/hooks'
import type { AaveLikeLendingProtocol } from 'lendingProtocols'
import { LendingProtocol } from 'lendingProtocols'

export const useAaveLikeHeadlineDetails = ({
  maxRiskRatio,
  protocol,
  network,
}: {
  protocol: AaveLikeLendingProtocol
  network: NetworkNames
  maxRiskRatio?: IRiskRatio
}) => {
  const isSparkProtocol = protocol === LendingProtocol.SparkV3
  const minRiskRatio = new RiskRatio(new BigNumber(1.1), RiskRatio.TYPE.MULITPLE)

  const minYields = useAaveEarnYields(
    !isSparkProtocol ? minRiskRatio : undefined,
    protocol,
    network,
    ['7Days'],
  )
  const maxYields = useAaveEarnYields(
    !isSparkProtocol ? maxRiskRatio || minRiskRatio : undefined,
    protocol,
    network,
    ['7Days', '7DaysOffset', '90Days', '90DaysOffset'],
  )

  const tvlData = useAaveTvl(protocol, network)

  const { headlineDetails, isLoading } = useOmniYieldLoopHeadline({ maxYields, minYields, tvlData })

  return {
    headlineDetails,
    isLoading,
  }
}
