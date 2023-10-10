import { RiskRatio } from '@oasisdex/dma-library'
import BigNumber from 'bignumber.js'
import type { AdjustRiskViewConfig } from 'features/aave/components'
import { richFormattedBoundary } from 'features/aave/components'
import { EXTERNAL_LINKS } from 'helpers/applicationLinks'
import { formatBigNumber } from 'helpers/formatters/format'

const adjustRiskSliderConfigForStethEth: AdjustRiskViewConfig = {
  liquidationPriceFormatter: (qty) => {
    return richFormattedBoundary({ value: formatBigNumber(qty, 4), unit: 'STETH/ETH' })
  },
  rightBoundary: {
    valueExtractor: (data) => data?.oracleAssetPrice,
    formatter: (qty) => {
      return richFormattedBoundary({ value: formatBigNumber(qty, 4), unit: 'STETH/ETH' })
    },
    translationKey: 'open-earn.aave.vault-form.configure-multiple.current-price',
  },
  link: {
    url: EXTERNAL_LINKS.DUNE_ORG_STETHETH_PEG_HISTORY,
    textTranslationKey: 'open-earn.aave.vault-form.configure-multiple.historical-ratio',
  },
  riskRatios: {
    minimum: new RiskRatio(new BigNumber('1.1'), RiskRatio.TYPE.MULITPLE),
    default: 'slightlyLessThanMaxRisk',
  },
}

const adjustRiskSliderConfigForWstethEth: AdjustRiskViewConfig = {
  liquidationPriceFormatter: (qty) => {
    return richFormattedBoundary({ value: formatBigNumber(qty, 4), unit: 'WSTETH/ETH' })
  },
  rightBoundary: {
    valueExtractor: (data) => data?.oraclesPricesRatio,
    formatter: (qty) => {
      return richFormattedBoundary({ value: formatBigNumber(qty, 4), unit: 'WSTETH/ETH' })
    },
    translationKey: 'open-earn.aave.vault-form.configure-multiple.current-price',
  },
  link: {
    url: EXTERNAL_LINKS.DUNE_ORG_STETHETH_PEG_HISTORY,
    textTranslationKey: 'open-earn.aave.vault-form.configure-multiple.historical-ratio',
  },
  riskRatios: {
    minimum: new RiskRatio(new BigNumber('1.1'), RiskRatio.TYPE.MULITPLE),
    default: new RiskRatio(new BigNumber('7.5'), RiskRatio.TYPE.MULITPLE),
  },
}

export const adjustRiskSliders = {
  stethEth: adjustRiskSliderConfigForStethEth,
  wstethEth: adjustRiskSliderConfigForWstethEth,
}
