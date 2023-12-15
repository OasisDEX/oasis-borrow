import type BigNumber from 'bignumber.js'
import type { OmniContentCardBase } from 'features/omni-kit/components/details-section'
import { formatCryptoBalance, formatUsdValue } from 'helpers/formatters/format'
import { zero } from 'helpers/zero'

interface OmniCardDataBuyingPowerParams {
  afterBuyingPower?: BigNumber
  buyingPower: BigNumber
  collateralPrice: BigNumber
  collateralToken: string
}

export function useOmniCardDataBuyingPower({
  afterBuyingPower,
  buyingPower,
  collateralPrice,
  collateralToken,
}: OmniCardDataBuyingPowerParams): OmniContentCardBase {
  return {
    title: { key: 'omni-kit.content-card.buying-power.title' },
    value: formatUsdValue(buyingPower),
    ...(afterBuyingPower && {
      change: [formatUsdValue(afterBuyingPower)],
    }),
    ...(buyingPower.gt(zero) && {
      footnote: ['', formatCryptoBalance(buyingPower.div(collateralPrice)), collateralToken],
    }),
  }
}
