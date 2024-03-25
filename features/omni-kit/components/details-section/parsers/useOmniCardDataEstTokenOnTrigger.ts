import type BigNumber from 'bignumber.js'
import type {
  OmniContentCardBase,
  OmniContentCardDataWithModal,
} from 'features/omni-kit/components/details-section'
import { formatCryptoBalance } from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'

interface OmniCardDataEstTokenOnTriggerParams extends OmniContentCardDataWithModal {
  dynamicStopLossPrice?: BigNumber
  afterDynamicStopLossPrice?: BigNumber
  closeToToken: string
  stateCloseToToken: string
  maxToken?: BigNumber
  afterMaxToken?: BigNumber
  savingCompareToLiquidation?: BigNumber
}

export function useOmniCardDataEstTokenOnTrigger({
  dynamicStopLossPrice,
  afterDynamicStopLossPrice,
  closeToToken,
  stateCloseToToken,
  maxToken,
  afterMaxToken,
  savingCompareToLiquidation,
  modal,
}: OmniCardDataEstTokenOnTriggerParams): OmniContentCardBase {
  const { t } = useTranslation()

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
          `${formatCryptoBalance(savingCompareToLiquidation)} ${stateCloseToToken} ${t(
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
