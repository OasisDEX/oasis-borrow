import type BigNumber from 'bignumber.js'
import { getCollateralDuringLiquidation } from 'features/automation/protection/stopLoss/helpers'
import type {
  OmniContentCardBase,
  OmniContentCardDataWithModal,
} from 'features/omni-kit/components/details-section'
import { formatCryptoBalance } from 'helpers/formatters/format'
import { one } from 'helpers/zero'
import { useTranslation } from 'next-i18next'

interface OmniCardDataEstTokenOnTriggerParams extends OmniContentCardDataWithModal {
  isCollateralActive: boolean
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

  const savingCompareToLiquidation =
    dynamicStopLossPrice && maxToken
      ? maxToken
          .minus(collateralDuringLiquidation)
          .times(!isCollateralActive ? dynamicStopLossPrice : one)
      : undefined

  return {
    title: t('manage-multiply-vault.card.max-token-on-stop-loss-trigger', {
      token: closeToToken,
    }),
    modal,
    value: dynamicStopLossPrice && maxToken ? formatCryptoBalance(maxToken) : '-',
    ...(dynamicStopLossPrice &&
      savingCompareToLiquidation && {
        unit: closeToToken,
        footnote: [
          `${formatCryptoBalance(savingCompareToLiquidation)} ${closeToToken} ${t(
            'manage-multiply-vault.card.saving-comp-to-liquidation',
          )}`,
        ],
      }),
    ...(afterDynamicStopLossPrice &&
      afterMaxToken && {
        change: [
          `${t('manage-multiply-vault.card.up-to')} ${formatCryptoBalance(
            afterMaxToken,
          )} ${stateCloseToToken}`,
        ],
      }),
  }
}
