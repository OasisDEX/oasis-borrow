import type BigNumber from 'bignumber.js'
import { getPriceChangeColor } from 'components/vault/VaultDetails'
import type { AaveTotalValueLocked } from 'features/aave/aave-context'
import { formatCryptoBalance, formatPercent } from 'helpers/formatters/format'
import { zero } from 'helpers/zero'
import type { AaveLikeYieldsResponse } from 'lendingProtocols/aave-like-common'
import { has7daysYield, has90daysYield } from 'lendingProtocols/aave-like-common'
import { useTranslation } from 'next-i18next'

export const useOmniYieldLoopHeadline = ({
  minYields,
  maxYields,
  tvlData,
}: {
  minYields: AaveLikeYieldsResponse | undefined
  maxYields: AaveLikeYieldsResponse | undefined
  tvlData: AaveTotalValueLocked | undefined
}) => {
  const { t } = useTranslation()

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
