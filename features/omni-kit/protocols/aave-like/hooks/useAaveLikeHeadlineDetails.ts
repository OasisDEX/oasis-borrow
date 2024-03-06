import type { IRiskRatio } from '@oasisdex/dma-library'
import { RiskRatio } from '@oasisdex/dma-library'
import BigNumber from 'bignumber.js'
import { useAaveEarnYields, useAaveTvl } from 'features/aave/hooks'
import { useOmniGeneralContext } from 'features/omni-kit/contexts'
import { useOmniYieldLoopHeadline } from 'features/omni-kit/hooks'
import { isAaveLikeLendingProtocol, LendingProtocol } from 'lendingProtocols'

export const useAaveLikeHeadlineDetails = ({ maxRiskRatio }: { maxRiskRatio: IRiskRatio }) => {
  const {
    environment: { protocol, isYieldLoopWithData, isOpening, network },
  } = useOmniGeneralContext()

  if (!(isYieldLoopWithData && isOpening)) {
    return { headlineDetails: [], isLoading: false }
  }

  if (!isAaveLikeLendingProtocol(protocol)) {
    throw Error('Given protocol is not aave-like')
  }

  const isSparkProtocol = protocol === LendingProtocol.SparkV3
  const minRiskRatio = new RiskRatio(new BigNumber(1.1), RiskRatio.TYPE.MULITPLE)

  const minYields = useAaveEarnYields(
    !isSparkProtocol ? minRiskRatio : undefined,
    protocol,
    network.name,
    ['7Days'],
  )
  const maxYields = useAaveEarnYields(
    !isSparkProtocol ? maxRiskRatio : undefined,
    protocol,
    network.name,
    ['7Days', '7DaysOffset', '90Days', '90DaysOffset'],
  )

  const tvlData = useAaveTvl(protocol, network.name)

  const { headlineDetails, isLoading } = useOmniYieldLoopHeadline({ maxYields, minYields, tvlData })

  return {
    headlineDetails,
    isLoading,
  }
}
