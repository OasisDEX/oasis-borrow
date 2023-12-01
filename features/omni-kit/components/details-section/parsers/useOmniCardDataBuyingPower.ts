import type BigNumber from 'bignumber.js'
import type { OmniContentCardBase } from 'features/omni-kit/components/details-section'
import { formatCryptoBalance } from 'helpers/formatters/format'
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
    value: `$${formatCryptoBalance(buyingPower)}`,
    ...(afterBuyingPower && {
      change: [`$${formatCryptoBalance(afterBuyingPower)}`],
    }),
    ...(buyingPower.gt(zero) && {
      footnote: ['', formatCryptoBalance(buyingPower.div(collateralPrice)), collateralToken],
    }),
  }
}
