import type BigNumber from 'bignumber.js'
import { FLASH_MINT_LIMIT_PER_TX } from 'components/constants'
import { AppLink } from 'components/Links'
import { MessageCard } from 'components/MessageCard'
import type { VaultErrorMessage } from 'features/form/errorMessagesHandler'
import { EXTERNAL_LINKS } from 'helpers/applicationLinks'
import { formatCryptoBalance } from 'helpers/formatters/format'
import { UnreachableCaseError } from 'helpers/UnreachableCaseError'
import { zero } from 'helpers/zero'
import { Trans, useTranslation } from 'next-i18next'
import React from 'react'
import type { Dictionary } from 'ts-essentials'

const KbLink = (
  <AppLink sx={{ color: 'critical100' }} href={EXTERNAL_LINKS.KB.MINIMUM_VAULT_DEBT_DUST} />
)

interface VaultErrorsProps {
  errorMessages: VaultErrorMessage[]
  maxGenerateAmount?: BigNumber
  ilkData?: { debtFloor: BigNumber; token: string }
  maxWithdrawAmount?: BigNumber
  autoType?: 'Auto-Buy' | 'Auto-Sell' | 'Stop-Loss'
  infoBag?: Record<string, string>
}

export function VaultErrors({
  errorMessages,
  maxGenerateAmount = zero,
  maxWithdrawAmount = zero,
  ilkData: { debtFloor, token } = { debtFloor: zero, token: '' },
  autoType,
  infoBag,
}: VaultErrorsProps) {
  const { t } = useTranslation()
  if (!errorMessages.length) return null

  function applyErrorMessageTranslation(message: VaultErrorMessage) {
    const translate = (key: string, args?: Dictionary<any>) => t(`vault-errors.${key}`, args || {})
    switch (message) {
      case 'internalError':
        return translate('internal-error')
      case 'executionLTVSmallerThanTargetLTV':
        return translate('auto-sell-execution-ltv-smaller-than-target')
      case 'executionLTVBiggerThanTargetLTV':
        return translate('auto-buy-execution-ltv-bigger-than-target')
      case 'executionLTVBiggerThanCurrentLTV':
        return translate('auto-buy-execution-ltv-bigger-than-current-ltv')
      case 'executionLTVSmallerThanCurrentLTV':
        return translate('auto-sell-execution-ltv-smaller-than-current-ltv')
      case 'executionLTVNearToAutoSellTrigger':
        return translate('auto-buy-execution-ltv-near-to-auto-sell-trigger')
      case 'depositAmountExceedsCollateralBalance':
        return translate('deposit-amount-exceeds-collateral-balance')
      case 'depositDaiAmountExceedsDaiBalance':
        return translate('deposit-dai-amount-exceeds-dai-balance')
      case 'generateAmountExceedsDaiYieldFromDepositingCollateral':
        return translate('generate-amount-exceeds-dai-yield-from-depositing-collateral')
      case 'generateAmountExceedsDaiYieldFromDepositingCollateralAtNextPrice':
        return translate(
          'generate-amount-exceeds-dai-yield-from-depositing-collateral-at-next-price',
        )
      case 'generateAmountExceedsDebtCeiling':
        return translate('generate-amount-exceeds-debt-ceiling', {
          maxGenerateAmount: formatCryptoBalance(maxGenerateAmount),
        })
      case 'generateAmountMoreThanMaxFlashAmount':
        return translate('generate-amount-more-than-max-flash-amount', {
          maxFlashAmount: FLASH_MINT_LIMIT_PER_TX.toFormat(0),
        })
      case 'generateAmountLessThanDebtFloor':
        return (
          <Trans
            i18nKey="vault-errors.generate-amount-less-than-debt-floor"
            values={{ debtFloor: formatCryptoBalance(debtFloor) }}
            components={[KbLink]}
          />
        )
      case 'customAllowanceAmountExceedsMaxUint256':
        return translate('custom-allowance-amount-exceeds-maxuint256')
      case 'customAllowanceAmountLessThanDepositAmount':
        return translate('custom-allowance-amount-less-than-deposit-amount')
      case 'depositingAllEthBalance':
        return translate('depositing-all-eth-balance')
      case 'ledgerWalletContractDataDisabled':
        return translate('ledger-enable-contract-data')
      case 'insufficientEthFundsForTx':
        return translate('insufficient-eth-balance')
      case 'exchangeError':
        return translate('exchange-error')
      case 'withdrawAmountExceedsFreeCollateral':
        return translate('withdraw-amount-exceeds-free-collateral', {
          maxWithdrawAmount: formatCryptoBalance(maxWithdrawAmount),
          token: token,
        })
      case 'withdrawAmountExceedsFreeCollateralAtNextPrice':
        return translate('withdraw-amount-exceeds-free-collateral-at-next-price', {
          maxWithdrawAmount: formatCryptoBalance(maxWithdrawAmount),
          token: token,
        })
      case 'generateAmountExceedsDaiYieldFromTotalCollateral':
        return translate('generate-amount-exceeds-dai-yield-from-total-collateral')
      case 'generateAmountExceedsDaiYieldFromTotalCollateralAtNextPrice':
        return translate('generate-amount-exceeds-dai-yield-from-total-collateral-at-next-price')
      case 'paybackAmountExceedsDaiBalance':
        return translate('payback-amount-exceeds-dai-balance')
      case 'paybackAmountExceedsVaultDebt':
        return translate('payback-amount-exceeds-vault-debt')
      case 'debtWillBeLessThanDebtFloor':
        return translate('debt-will-be-less-than-debt-floor', {
          debtFloor: formatCryptoBalance(debtFloor),
        })
      case 'customCollateralAllowanceAmountExceedsMaxUint256':
        return translate('custom-collateral-allowance-amount-exceeds-maxuint256')
      case 'customCollateralAllowanceAmountLessThanDepositAmount':
        return translate('custom-collateral-allowance-amount-less-than-deposit-amount')
      case 'customDaiAllowanceAmountExceedsMaxUint256':
        return translate('custom-dai-allowance-amount-exceeds-maxuint256')
      case 'customDaiAllowanceAmountLessThanPaybackAmount':
        return translate('custom-dai-allowance-amount-less-than-payback-amount')
      case 'shouldShowExchangeError':
        return translate('exchange-error')
      case 'hasToDepositCollateralOnEmptyVault':
        return translate('has-to-deposit-collateral-on-empty-vault')
      case 'withdrawCollateralOnVaultUnderDebtFloor':
        return (
          <Trans
            i18nKey="vault-errors.withdraw-collateral-on-vault-under-debt-floor"
            values={{ debtFloor: formatCryptoBalance(debtFloor) }}
            components={[KbLink]}
          />
        )
      case 'depositCollateralOnVaultUnderDebtFloor':
        return (
          <Trans
            i18nKey="vault-errors.deposit-collateral-on-vault-under-debt-floor"
            values={{ debtFloor: formatCryptoBalance(debtFloor) }}
            components={[KbLink]}
          />
        )
      case 'invalidSlippage':
        return translate('invalid-slippage')
      case 'afterCollRatioBelowStopLossRatio':
        return translate('after-coll-ratio-below-stop-loss-ratio')
      case 'afterCollRatioBelowAutoSellRatio':
        return translate('after-coll-ratio-below-auto-sell-ratio')
      case 'afterCollRatioAboveAutoBuyRatio':
        return translate('after-coll-ratio-above-auto-buy-ratio')
      case 'afterCollRatioBelowConstantMultipleSellRatio':
        return translate('after-coll-ratio-below-constant-multiple-sell-ratio')
      case 'afterCollRatioAboveConstantMultipleBuyRatio':
        return translate('after-coll-ratio-above-constant-multiple-buy-ratio')
      case 'vaultWillBeTakenUnderMinActiveColRatio':
        return translate('vault-will-be-taken-under-min-active-col-ratio')
      case 'stopLossOnNearLiquidationRatio':
        return translate('stop-loss-near-liquidation-ratio')
      case 'stopLossHigherThanCurrentOrNext':
        return translate('stop-loss-near-liquidation-ratio')
      case 'maxDebtForSettingStopLoss':
        return translate('stop-loss-max-debt')
      case 'targetCollRatioExceededDustLimitCollRatio':
        return translate('target-coll-ratio-exceeded-dust-limit-coll-ratio')
      case 'autoSellTriggerHigherThanAutoBuyTarget':
        return translate('auto-sell-trigger-higher-than-auto-buy-target')
      case 'autoBuyTriggerLowerThanAutoSellTarget':
        return translate('auto-buy-trigger-lower-than-auto-sell-target')
      case 'stopLossTriggerHigherThanAutoBuyTarget':
        return translate('stop-loss-trigger-higher-than-auto-buy-target')
      case 'stopLossTriggerLtvLowerThanAutoBuy':
        return translate('stop-loss-trigger-ltv-lower-than-auto-buy')
      case 'cantSetupAutoBuyOrSellWhenConstantMultipleEnabled':
        return translate('cant-setup-auto-buy-or-sell-when-constant-multiple-enabled', { autoType })
      case 'minSellPriceWillPreventSellTrigger':
        return translate('min-sell-price-will-prevent-sell-trigger')
      case 'maxBuyPriceWillPreventBuyTrigger':
        return translate('max-buy-price-will-prevent-buy-trigger')
      case 'autoTakeProfitTriggeredImmediately':
        return translate('auto-take-profit-triggered-immediately')
      case 'takeProfitWillTriggerImmediatelyAfterVaultReopen':
        return translate('take-profit-will-trigger-immediately-after-vault-reopen')
      case 'autoBuyMaxBuyPriceNotSpecified':
        return (
          <Trans
            i18nKey="vault-errors.auto-buy-max-price-requred"
            components={{
              1: <strong />,
            }}
          />
        )
      case 'minimumSellPriceNotProvided':
        return (
          <Trans
            i18nKey="vault-errors.minimum-sell-price-not-provided"
            components={{
              1: <strong />,
            }}
          />
        )
      case 'tooLowLtvToSetupAutoBuy':
        return translate('ltv-too-low-for-auto-buy')
      case 'tooLowLtvToSetupAutoSell':
        return translate('ltv-too-low-for-auto-sell')
      case 'tooHighStopLossToSetupAutoSell':
        return translate('sl-too-high-for-auto-sell', {
          maxLTV: infoBag?.['maxLTV'],
        })
      case 'autoSellWillBlockStopLoss':
        return translate('auto-sell-will-make-stop-loss-not-trigger')
      case 'stopLossTriggeredByAutoBuy':
        return translate('stop-loss-triggered-by-auto-buy')

      default:
        throw new UnreachableCaseError(message)
    }
  }

  const messages = errorMessages.reduce(
    (acc, message) => [...acc, applyErrorMessageTranslation(message)],
    [] as (string | JSX.Element)[],
  )

  return <MessageCard {...{ messages, type: 'error', withBullet: messages.length > 1 }} />
}
