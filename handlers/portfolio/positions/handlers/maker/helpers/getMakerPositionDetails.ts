import { RiskRatio } from '@oasisdex/dma-library'
import BigNumber from 'bignumber.js'
import { amountFromRay } from 'blockchain/utils'
import { OmniProductType } from 'features/omni-kit/types'
import type { MakerDiscoverPositionsIlk } from 'handlers/portfolio/positions/handlers/maker/types'
import { type PositionDetail } from 'handlers/portfolio/types'
import { formatCryptoBalance, formatDecimalAsPercent } from 'helpers/formatters/format'
import { one, zero } from 'helpers/zero'

interface GetAjnaPositionDetailsParams {
  collateral: string
  collateralPrice: BigNumber
  daiPrice: BigNumber
  debt: string
  ilk: MakerDiscoverPositionsIlk
  liquidationPrice: string
  primaryToken: string
  type: OmniProductType
}

export function getMakerPositionDetails({
  collateral,
  collateralPrice,
  daiPrice,
  debt,
  ilk,
  liquidationPrice,
  primaryToken,
  type,
}: GetAjnaPositionDetailsParams): PositionDetail[] {
  const { liquidationRatio, stabilityFee } = ilk
  const riskRatio = new RiskRatio(
    Number(collateral) > 0
      ? new BigNumber(debt).times(daiPrice).div(new BigNumber(collateral).times(collateralPrice))
      : zero,
    RiskRatio.TYPE.LTV,
  )
  const maxRiskRatio = new RiskRatio(
    one.div(amountFromRay(new BigNumber(liquidationRatio))),
    RiskRatio.TYPE.LTV,
  )
  const fee = new BigNumber(stabilityFee).minus(one)

  switch (type) {
    case OmniProductType.Borrow: {
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
          value: `${formatCryptoBalance(new BigNumber(liquidationPrice))} ${primaryToken}`,
          subvalue: `Now ${formatCryptoBalance(new BigNumber(collateralPrice))} ${primaryToken}`,
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
      return [
        {
          type: 'netValue',
          value: '',
        },
        {
          type: 'earnings',
          value: '',
        },
        {
          type: 'apy',
          value: '',
        },
        {
          type: '90dApy',
          value: '',
        },
      ]
    }
    case OmniProductType.Multiply: {
      return [
        {
          type: 'netValue',
          value: '',
        },
        {
          type: 'pnl',
          value: '',
        },
        {
          type: 'liquidationPrice',
          value: '',
          subvalue: '',
        },
        {
          type: 'ltv',
          value: '',
          subvalue: '',
        },
        {
          type: 'multiple',
          value: '',
          subvalue: '',
        },
      ]
    }
  }
}
