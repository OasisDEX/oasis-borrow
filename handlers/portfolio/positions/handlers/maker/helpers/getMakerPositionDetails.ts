import { RiskRatio } from '@oasisdex/dma-library'
import BigNumber from 'bignumber.js'
import { amountFromRay } from 'blockchain/utils'
import { collateralPriceAtRatio } from 'blockchain/vault.maths'
import { OmniProductType } from 'features/omni-kit/types'
import { notAvailable } from 'handlers/portfolio/constants'
import type { MakerDiscoverPositionsIlk } from 'handlers/portfolio/positions/handlers/maker/types'
import { type PositionDetail } from 'handlers/portfolio/types'
import { formatCryptoBalance, formatDecimalAsPercent, formatUsdValue } from 'helpers/formatters/format'
import { one, zero } from 'helpers/zero'

interface GetAjnaPositionDetailsParams {
  collateral: string
  collateralPrice: BigNumber
  cumulativeDepositUSD: string
  cumulativeFeesUSD: string
  cumulativeWithdrawnUSD: string
  daiPrice: BigNumber
  debt: BigNumber
  ilk: MakerDiscoverPositionsIlk
  liquidationPrice: string
  netValue: BigNumber
  primaryToken: string
  type: OmniProductType
}

export function getMakerPositionDetails({
  collateral,
  collateralPrice,
  cumulativeDepositUSD,
  cumulativeFeesUSD,
  cumulativeWithdrawnUSD,
  daiPrice,
  debt,
  ilk,
  // liquidationPrice,
  netValue,
  primaryToken,
  type,
}: GetAjnaPositionDetailsParams): PositionDetail[] {
  const { liquidationRatio, stabilityFee } = ilk
  const minCollRatio = amountFromRay(new BigNumber(liquidationRatio))
  const riskRatio = new RiskRatio(
    Number(collateral) > 0
      ? new BigNumber(debt).times(daiPrice).div(new BigNumber(collateral).times(collateralPrice))
      : zero,
    RiskRatio.TYPE.LTV,
  )
  const maxRiskRatio = new RiskRatio(one.div(minCollRatio), RiskRatio.TYPE.LTV)
  const liquidationPrice = collateralPriceAtRatio({
    collateral: new BigNumber(collateral),
    colRatio: minCollRatio,
    vaultDebt: new BigNumber(debt),
  })

  switch (type) {
    case OmniProductType.Borrow: {
      const fee = new BigNumber(stabilityFee).minus(one)

      return [
        {
          type: 'collateralLocked',
          value: `${formatCryptoBalance(new BigNumber(collateral))} ${primaryToken}`,
        },
        {
          type: 'totalDebt',
          value: `${formatCryptoBalance(new BigNumber(debt))} DAI`,
        },
        {
          type: 'liquidationPrice',
          value: formatUsdValue(new BigNumber(liquidationPrice)),
          subvalue: `Now ${formatUsdValue(new BigNumber(collateralPrice))}`,
        },
        {
          type: 'ltv',
          value: formatDecimalAsPercent(riskRatio.loanToValue),
          subvalue: `Max ${formatDecimalAsPercent(maxRiskRatio.loanToValue)}`,
        },
        {
          type: 'borrowRate',
          value: formatDecimalAsPercent(fee),
        },
      ]
    }
    case OmniProductType.Earn: {
      const earnings = netValue
        .minus(cumulativeDepositUSD)
        .plus(cumulativeWithdrawnUSD)
        .minus(cumulativeFeesUSD)
        .div(daiPrice)

      return [
        {
          type: 'netValue',
          value: formatUsdValue(netValue),
        },
        {
          type: 'earnings',
          value: `${formatCryptoBalance(earnings)} DAI`,
        },
        {
          type: 'apy',
          value: notAvailable,
        },
      ]
    }
    case OmniProductType.Multiply: {
      const pnl = new BigNumber(cumulativeWithdrawnUSD)
        .plus(netValue)
        .minus(cumulativeFeesUSD)
        .minus(cumulativeDepositUSD)
        .div(cumulativeDepositUSD)

      return [
        {
          type: 'netValue',
          value: formatUsdValue(netValue),
        },
        {
          type: 'pnl',
          value: formatDecimalAsPercent(pnl),
          accent: pnl.gt(zero) ? 'positive' : 'negative',
        },
        {
          type: 'liquidationPrice',
          value: formatUsdValue(new BigNumber(liquidationPrice)),
          subvalue: `Now ${formatUsdValue(new BigNumber(collateralPrice))}`,
        },
        {
          type: 'ltv',
          value: formatDecimalAsPercent(riskRatio.loanToValue),
          subvalue: `Max ${formatDecimalAsPercent(maxRiskRatio.loanToValue)}`,
        },
        {
          type: 'multiple',
          value: `${riskRatio.multiple.toFixed(2)}x`,
          subvalue: `Max ${maxRiskRatio.multiple.toFixed(2)}x`,
        },
      ]
    }
  }
}
