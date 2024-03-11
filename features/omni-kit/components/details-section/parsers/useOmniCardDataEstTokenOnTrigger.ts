import type BigNumber from 'bignumber.js'
import { getCollateralDuringLiquidation } from 'features/automation/protection/stopLoss/helpers'
import type {
  OmniContentCardBase,
  OmniContentCardDataWithModal,
} from 'features/omni-kit/components/details-section'
import { formatAmount } from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'

interface OmniCardDataEstTokenOnTriggerParams extends OmniContentCardDataWithModal {
  isCollateralActive: boolean
  collateralToken: string
  dynamicStopLossPrice?: BigNumber
  afterDynamicStopLossPrice?: BigNumber
  closeToToken: string
  stateCloseToToken: string
  collateralAmount: BigNumber
  debtAmount: BigNumber
  liquidationPrice: BigNumber
  liquidationPenalty: BigNumber
  maxToken?: BigNumber
  afterMaxToken?: BigNumber
}

export function useOmniCardDataEstTokenOnTrigger({
  isCollateralActive,
  collateralToken,
  dynamicStopLossPrice,
  afterDynamicStopLossPrice,
  closeToToken,
  stateCloseToToken,
  collateralAmount,
  debtAmount,
  liquidationPrice,
  liquidationPenalty,
  maxToken,
  afterMaxToken,
  modal,
}: OmniCardDataEstTokenOnTriggerParams): OmniContentCardBase {
  const { t } = useTranslation()

  const collateralDuringLiquidation = getCollateralDuringLiquidation({
    lockedCollateral: collateralAmount,
    debt: debtAmount,
    liquidationPrice,
    liquidationPenalty,
  })

  const savingCompareToLiquidation = maxToken?.minus(collateralDuringLiquidation)

  const formatTokenOrDebtToken = (val: BigNumber, stopPrice: BigNumber): string => {
    return isCollateralActive
      ? `${formatAmount(val, collateralToken)}`
      : `${formatAmount(val.multipliedBy(stopPrice), 'USD')}`
  }

  return {
    title: t('manage-multiply-vault.card.max-token-on-stop-loss-trigger', {
      token: closeToToken,
    }),
    modal,
    value:
      dynamicStopLossPrice && maxToken
        ? formatTokenOrDebtToken(maxToken, dynamicStopLossPrice)
        : '-',
    ...(dynamicStopLossPrice &&
      savingCompareToLiquidation && {
        unit: closeToToken,
        footnote: [
          `${formatTokenOrDebtToken(
            savingCompareToLiquidation,
            dynamicStopLossPrice,
          )} ${closeToToken} ${t('manage-multiply-vault.card.saving-comp-to-liquidation')}`,
        ],
      }),
    ...(afterDynamicStopLossPrice &&
      afterMaxToken && {
        change: [
          `${t('manage-multiply-vault.card.up-to')} ${formatTokenOrDebtToken(
            afterMaxToken,
            afterDynamicStopLossPrice,
          )} ${stateCloseToToken} ${t('system.cards.common.after')}`,
        ],
      }),
  }
}
