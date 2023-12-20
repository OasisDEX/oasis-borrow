import type BigNumber from 'bignumber.js'
import { AppLink } from 'components/Links'
import { MessageCard } from 'components/MessageCard'
import type { VaultWarningMessage } from 'features/form/warningMessagesHandler'
import { EXTERNAL_LINKS } from 'helpers/applicationLinks'
import { formatCryptoBalance } from 'helpers/formatters/format'
import { UnreachableCaseError } from 'helpers/UnreachableCaseError'
import { zero } from 'helpers/zero'
import { Trans, useTranslation } from 'next-i18next'
import React from 'react'
import type { Dictionary } from 'ts-essentials'

const ConstantMultipleKBLink = (
  <AppLink sx={{ color: 'warning100' }} href={EXTERNAL_LINKS.KB.WHAT_IS_CONSTANT_MULTIPLE} />
)

const AutoTakeProfitKBLink = (
  <AppLink sx={{ color: 'warning100' }} href={EXTERNAL_LINKS.KB.TAKE_PROFIT} />
)

interface VaultWarningsProps {
  warningMessages: VaultWarningMessage[]
  ilkData?: { debtFloor: BigNumber }
  isAutoSellEnabled?: boolean
  isAutoBuyEnabled?: boolean
}

export function VaultWarnings({
  warningMessages,
  ilkData: { debtFloor } = { debtFloor: zero },
  isAutoSellEnabled,
  isAutoBuyEnabled,
}: VaultWarningsProps) {
  const { t } = useTranslation()
  if (!warningMessages.length) return null

  function applyWarningMessageTranslation(message: VaultWarningMessage) {
    const translate = (key: string, args?: Dictionary<any>) =>
      t(`vault-warnings.${key}`, args || {})
    switch (message) {
      case 'potentialGenerateAmountLessThanDebtFloor':
        return translate('potential-generate-amount-less-than-debt-floor', {
          debtFloor: formatCryptoBalance(debtFloor),
        })
      case 'debtIsLessThanDebtFloor':
        return translate('debt-is-less-than-debt-floor', {
          debtFloor: formatCryptoBalance(debtFloor),
        })
      case 'vaultWillBeAtRiskLevelDanger':
        return translate('vault-will-be-at-risk-level-danger')
      case 'vaultWillBeAtRiskLevelWarning':
        return translate('vault-will-be-at-risk-level-warning')
      case 'vaultWillBeAtRiskLevelDangerAtNextPrice':
        return translate('vault-will-be-at-risk-level-danger-at-next-price')
      case 'vaultWillBeAtRiskLevelWarningAtNextPrice':
        return translate('vault-will-be-at-risk-level-warning-at-next-price')
      case 'highSlippage':
        return t('user-settings.slippage-limit.warnings.high-slippage')
      case 'customSlippageOverridden':
        return t('guni-slippage-overridden')
      case 'vaultIsCurrentlyUnderMinActiveColRatio':
        return translate('vault-is-currently-under-min-active-col-ratio')
      case 'vaultWillRemainUnderMinActiveColRatio':
        return translate('vault-will-remain-under-min-active-col-ratio')
      case 'potentialInsufficientEthFundsForTx':
        return translate('insufficient-eth-balance')
      case 'currentCollRatioCloseToStopLoss':
        return translate('coll-ratio-close-to-current')
      case 'noMinSellPriceWhenStopLossEnabled':
        return translate('no-min-sell-price-when-stop-loss-enabled')
      case 'settingAutoBuyTriggerWithNoThreshold':
        return translate('auto-buy-with-no-max-price-threshold')
      case 'autoSellTriggerCloseToStopLossTrigger':
        return translate('auto-sell-trigger-close-to-stop-loss-trigger')
      case 'autoSellTargetCloseToAutoBuyTrigger':
        return translate('auto-sell-target-close-to-auto-buy-trigger')
      case 'stopLossTriggerCloseToAutoSellTrigger':
        return translate('stop-loss-trigger-close-to-auto-sell-trigger')
      case 'autoBuyTargetCloseToStopLossTrigger':
        return translate('auto-buy-target-close-to-stop-loss-trigger')
      case 'autoBuyTargetCloseToAutoSellTrigger':
        return translate('auto-buy-target-close-to-auto-sell-trigger')
      case 'autoBuyTriggeredImmediately':
        return translate('auto-buy-triggered-immediately')
      case 'autoSellTriggeredImmediately':
        return translate('auto-sell-triggered-immediately')
      case 'constantMultipleAutoSellTriggeredImmediately':
        return translate('constant-multiple-auto-sell-triggered-immediately')
      case 'constantMultipleAutoBuyTriggeredImmediately':
        return translate('constant-multiple-auto-buy-triggered-immediately')
      case 'existingTakeProfitTriggerAfterVaultReopen':
        return translate('existing-take-profit-trigger-after-vault-reopen')
      case 'constantMultipleSellTriggerCloseToStopLossTrigger':
        return (
          <Trans
            i18nKey="vault-warnings.constant-multiple-sell-trigger-close-to-stop-loss-trigger"
            components={[ConstantMultipleKBLink]}
          />
        )
      case 'autoTakeProfitTriggerLowerThanAutoBuyTrigger':
        return (
          <Trans
            i18nKey="vault-warnings.auto-take-profit-trigger-lower-than-auto-buy-trigger"
            components={[AutoTakeProfitKBLink]}
          />
        )
      case 'autoTakeProfitTriggerLowerThanConstantMultipleBuyTrigger':
        return (
          <Trans
            i18nKey="vault-warnings.auto-take-profit-trigger-lower-than-constant-multiple-buy-trigger"
            components={[AutoTakeProfitKBLink]}
          />
        )
      case 'autoBuyTriggerGreaterThanAutoTakeProfit':
        return (
          <Trans
            i18nKey="vault-warnings.auto-buy-trigger-greater-than-auto-take-profit"
            components={[AutoTakeProfitKBLink]}
          />
        )
      case 'constantMultipleBuyTriggerGreaterThanAutoTakeProfit':
        return (
          <Trans
            i18nKey="vault-warnings.constant-multiple-buy-trigger-greater-than-auto-take-profit"
            components={[AutoTakeProfitKBLink]}
          />
        )
      case 'addingConstantMultipleWhenAutoSellOrBuyEnabled':
        return (
          <Trans
            i18nKey="vault-warnings.adding-constant-multiple-when-auto-sell-or-buy-enabled"
            values={{
              enabledTriggers:
                isAutoSellEnabled && isAutoBuyEnabled
                  ? `Auto-Sell ${t('and')} Auto-Buy`
                  : isAutoSellEnabled
                  ? 'Auto-Sell'
                  : isAutoBuyEnabled
                  ? 'Auto-Buy'
                  : t('active-triggers'),
            }}
            components={[ConstantMultipleKBLink]}
          />
        )
      case 'stopLossTriggerCloseToConstantMultipleSellTrigger':
        return (
          <Trans
            i18nKey="vault-warnings.stop-loss-trigger-close-to-constant-multiple-sell-trigger"
            components={[ConstantMultipleKBLink]}
          />
        )
      default:
        throw new UnreachableCaseError(message)
    }
  }

  const messages = warningMessages.reduce(
    (acc, message) => [...acc, applyWarningMessageTranslation(message)],
    [] as (string | JSX.Element)[],
  )

  return <MessageCard {...{ messages, type: 'warning', withBullet: messages.length > 1 }} />
}
