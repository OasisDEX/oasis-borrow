import type { IRiskRatio } from '@oasisdex/dma-library'
import { RiskRatio } from '@oasisdex/dma-library'
import BigNumber from 'bignumber.js'
import type { NetworkNames } from 'blockchain/networks'
import { getPriceChangeColor } from 'components/vault/VaultDetails'
import { useAaveEarnYields, useAaveTvl } from 'features/aave/hooks'
import { formatCryptoBalance, formatPercent } from 'helpers/formatters/format'
import { zero } from 'helpers/zero'
import type { AaveLikeLendingProtocol } from 'lendingProtocols'
import { LendingProtocol } from 'lendingProtocols'
import { has7daysYield, has90daysYield } from 'lendingProtocols/aave-like-common'
import { useTranslation } from 'next-i18next'

export const useAaveLikeHeadlineDetails = ({
  maxRiskRatio,
  protocol,
  network,
}: {
  protocol: AaveLikeLendingProtocol
  network: NetworkNames
  maxRiskRatio?: IRiskRatio
}) => {
  const { t } = useTranslation()
  const isSparkProtocol = protocol === LendingProtocol.SparkV3
  const minRiskRatio = new RiskRatio(new BigNumber('1.1'), RiskRatio.TYPE.MULITPLE)

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

  const headlineDetails = []
  if (minYields && maxYields) {
    const formatYield = (yieldVal: BigNumber) =>
      formatPercent(yieldVal, {
        precision: 2,
      })

    if (has7daysYield(minYields, false) && has7daysYield(maxYields)) {
      const yield7DaysMin = minYields.annualisedYield7days ?? zero
      const yield7DaysMax = maxYields.annualisedYield7days ?? zero

      const yield7DaysDiff = maxYields.annualisedYield7days.minus(
        maxYields.annualisedYield7daysOffset,
      )

      headlineDetails.push({
        label: t('open-earn.aave.product-header.current-yield'),
        value: `${formatYield(yield7DaysMin).toString()} - ${formatYield(
          yield7DaysMax,
        ).toString()}`,
        sub: formatPercent(yield7DaysDiff, {
          precision: 2,
          plus: true,
        }),
        subColor: getPriceChangeColor({
          collateralPricePercentageChange: yield7DaysDiff,
        }),
      })
    } else {
      headlineDetails.push({
        label: t('open-earn.aave.product-header.current-yield'),
        value: `n/a`,
      })
    }
  }

  if (maxYields && has90daysYield(maxYields)) {
    const yield90DaysDiff = maxYields.annualisedYield90daysOffset.minus(
      maxYields.annualisedYield90days,
    )
    headlineDetails.push({
      label: t('open-earn.aave.product-header.90-day-avg-yield'),
      value: formatPercent(maxYields.annualisedYield90days, {
        precision: 2,
      }),
      sub: formatPercent(yield90DaysDiff, {
        precision: 2,
        plus: true,
      }),
      subColor: getPriceChangeColor({
        collateralPricePercentageChange: yield90DaysDiff,
      }),
    })
  } else {
    headlineDetails.push({
      label: t('open-earn.aave.product-header.90-day-avg-yield'),
      value: `n/a`,
    })
  }

  tvlData?.totalValueLocked &&
    headlineDetails.push({
      label: t('open-earn.aave.product-header.total-value-locked'),
      value: formatCryptoBalance(tvlData.totalValueLocked),
    })

  return {
    headlineDetails,
    isLoading: !(!!tvlData && !!minYields && !!maxYields),
  }
}
