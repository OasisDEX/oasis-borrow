import { RiskRatio } from '@oasisdex/oasis-actions'
import BigNumber from 'bignumber.js'
import {
  AdjustRiskViewConfig,
  richFormattedBoundary,
} from 'features/aave/common/components/SidebarAdjustRiskView'
import { formatBigNumber } from 'helpers/formatters/format'

const adjustRiskSliderConfigForStethEth: AdjustRiskViewConfig = {
  liquidationPriceFormatter: (qty) => {
    return richFormattedBoundary({ value: formatBigNumber(qty, 2), unit: 'STETH/ETH' })
  },
  rightBoundary: {
    valueExtractor: (data) => data?.oracleAssetPrice,
    formatter: (qty) => {
      return richFormattedBoundary({ value: formatBigNumber(qty, 4), unit: 'STETH/ETH' })
    },
    translationKey: 'open-earn.aave.vault-form.configure-multiple.current-price',
  },
  link: {
    url: 'https://dune.com/chrisbduck/steth-eth-monitor',
    textTranslationKey: 'open-earn.aave.vault-form.configure-multiple.historical-ratio',
  },
  riskRatios: {
    minimum: new RiskRatio(new BigNumber('1.1'), RiskRatio.TYPE.MULITPLE),
    default: 'slightlyLessThanMaxRisk',
  },
}

const adjustRiskSliderConfigForWstethEth: AdjustRiskViewConfig = {
  liquidationPriceFormatter: (qty) => {
    return richFormattedBoundary({ value: formatBigNumber(qty, 2), unit: 'WSTETH/ETH' })
  },
  rightBoundary: {
    valueExtractor: (data) => data?.oraclesPricesRatio,
    formatter: (qty) => {
      return richFormattedBoundary({ value: formatBigNumber(qty, 4), unit: 'WSTETH/ETH' })
    },
    translationKey: 'open-earn.aave.vault-form.configure-multiple.current-price',
  },
  link: {
    url: 'https://dune.com/chrisbduck/steth-eth-monitor',
    textTranslationKey: 'open-earn.aave.vault-form.configure-multiple.historical-ratio',
  },
  riskRatios: {
    minimum: new RiskRatio(new BigNumber('1.1'), RiskRatio.TYPE.MULITPLE),
    default: new RiskRatio(new BigNumber(0.75), RiskRatio.TYPE.LTV),
  },
}

export const adjustRiskSliders = {
  stethEth: adjustRiskSliderConfigForStethEth,
  wstethEth: adjustRiskSliderConfigForWstethEth,
}
