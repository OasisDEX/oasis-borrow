import BigNumber from 'bignumber.js'
import type {
  OmniContentCardBase,
  OmniContentCardDataWithModal,
} from 'features/omni-kit/components/details-section'
import { formatCryptoBalance, formatDecimalAsPercent } from 'helpers/formatters/format'
import { zero } from 'helpers/zero'
import { useTranslation } from 'next-i18next'
import type { ThemeUIStyleObject } from 'theme-ui'

const getLiquidationPriceRatioColor = (ratio: BigNumber) => {
  const critical = new BigNumber(5)
  const warning = new BigNumber(20)

  if (ratio.isLessThanOrEqualTo(critical)) {
    return 'critical10'
  }
  return ratio.isLessThanOrEqualTo(warning) ? 'warning10' : 'success10'
}

interface OmniCardDataLiquidationPriceParams extends OmniContentCardDataWithModal {
  afterLiquidationRatio?: BigNumber
  liquidationRatio: BigNumber
  ratioToCurrentPrice?: BigNumber
  ratioLink: string
}

export function useOmniCardDataLiquidationRatio({
  afterLiquidationRatio,
  liquidationRatio,
  modal,
  ratioToCurrentPrice,
  ratioLink,
}: OmniCardDataLiquidationPriceParams): OmniContentCardBase & {
  customBackground: string
  customUnitStyle: ThemeUIStyleObject
} {
  const { t } = useTranslation()

  const unit = `(${formatDecimalAsPercent(ratioToCurrentPrice || zero)} ${
    ratioToCurrentPrice?.gt(zero) ? 'below' : 'above'
  } current ratio)`
  return {
    title: { key: 'omni-kit.content-card.liquidation-ratio.title' },
    value: formatCryptoBalance(liquidationRatio),
    unit,
    customUnitStyle: { fontSize: 2 },
    ...(afterLiquidationRatio && {
      change: ['', formatCryptoBalance(afterLiquidationRatio)],
    }),
    link: {
      label: t('manage-earn-vault.ratio-history'),
      url: ratioLink,
    },
    modal,
    customBackground: ratioToCurrentPrice
      ? getLiquidationPriceRatioColor(ratioToCurrentPrice.times(100))
      : '',
  }
}
