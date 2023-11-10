import { RiskRatio } from '@oasisdex/dma-library'
import BigNumber from 'bignumber.js'
import { amountFromRay } from 'blockchain/utils'
import { OmniProductType } from 'features/omni-kit/types'
import { type PositionDetail } from 'handlers/portfolio/types'
import { formatDecimalAsPercent } from 'helpers/formatters/format'
import { one } from 'helpers/zero'

interface GetAjnaPositionDetailsParams {
  collateral: string
  collateralPrice: BigNumber
  debt: string
  daiPrice: BigNumber
  liquidationPrice: string
  liquidationRatio: string
  primaryToken: string
  type: OmniProductType
}

export function getMakerPositionDetails({
  collateral,
  collateralPrice,
  debt,
  daiPrice,
  liquidationPrice,
  liquidationRatio,
  primaryToken,
  type,
}: GetAjnaPositionDetailsParams): PositionDetail[] {
  const riskRatio = new RiskRatio(
    new BigNumber(debt).times(daiPrice).div(new BigNumber(collateral).times(collateralPrice)),
    RiskRatio.TYPE.LTV,
  )
  const maxRiskRatio = new RiskRatio(
    one.div(amountFromRay(new BigNumber(liquidationRatio))),
    RiskRatio.TYPE.LTV,
  )

  switch (type) {
    case OmniProductType.Borrow: {
      return [
        {
          type: 'collateralLocked',
          value: `${collateral} ${primaryToken}`,
        },
        {
          type: 'totalDebt',
          value: `${debt} DAI`,
        },
        {
          type: 'liquidationPrice',
          value: `${liquidationPrice} ${primaryToken}`,
          subvalue: `Now ${collateralPrice} ${primaryToken}`,
        },
        {
          type: 'ltv',
          value: formatDecimalAsPercent(riskRatio.loanToValue),
          subvalue: `Max ${formatDecimalAsPercent(maxRiskRatio.loanToValue)}`,
        },
        {
          type: 'borrowRate',
          value: '',
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
