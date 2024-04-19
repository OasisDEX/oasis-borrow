import type BigNumber from 'bignumber.js'
import { getPriceChangeColor } from 'components/vault/VaultDetails'
import type { AaveTotalValueLocked } from 'features/aave/aave-context'
import { formatCryptoBalance, formatPercent } from 'helpers/formatters/format'
import type { GetYieldsResponseMapped } from 'helpers/lambda/yields'
import { zero } from 'helpers/zero'
import { useTranslation } from 'next-i18next'

export const useOmniYieldLoopHeadline = ({
  minYields,
  maxYields,
  maxYieldsOffset,
  tvlData,
}: {
  minYields: GetYieldsResponseMapped | undefined
  maxYields: GetYieldsResponseMapped | undefined
  maxYieldsOffset: GetYieldsResponseMapped | undefined
  tvlData?: AaveTotalValueLocked
}) => {
  const { t } = useTranslation()

  const headlineDetails = []
  if (minYields && maxYields && maxYieldsOffset) {
    const formatYield = (yieldVal: BigNumber) =>
      formatPercent(yieldVal, {
        precision: 2,
      })
    const yield7DaysMin = minYields.apy7d ?? zero
    const yield7DaysMax = maxYields.apy7d ?? zero

    const yield7DaysDiff = maxYields.apy7d.minus(maxYieldsOffset.apy7d)

    headlineDetails.push({
      label: t('open-earn.aave.product-header.current-yield'),
      value: `${formatYield(yield7DaysMin).toString()} - ${formatYield(yield7DaysMax).toString()}`,
      sub: formatPercent(yield7DaysDiff, {
        precision: 2,
        plus: true,
      }),
      subColor: getPriceChangeColor({
        collateralPricePercentageChange: yield7DaysDiff,
      }),
    })
  }

  if (maxYields && maxYieldsOffset) {
    const yield90DaysDiff = maxYieldsOffset.apy90d.minus(maxYields.apy90d)
    headlineDetails.push({
      label: t('open-earn.aave.product-header.90-day-avg-yield'),
      value: formatPercent(maxYields.apy90d, {
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
    isLoading: !(!!minYields && !!maxYields),
  }
}
