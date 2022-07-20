import BigNumber from 'bignumber.js'
import { IlkData } from 'blockchain/ilks'
import { FLASH_MINT_LIMIT_PER_TX } from 'components/constants'
import { AppLink } from 'components/Links'
import { MessageCard } from 'components/MessageCard'
import { VaultErrorMessage } from 'features/form/errorMessagesHandler'
import { formatCryptoBalance } from 'helpers/formatters/format'
import { UnreachableCaseError } from 'helpers/UnreachableCaseError'
import { zero } from 'helpers/zero'
import { Trans, useTranslation } from 'next-i18next'
import React from 'react'
import { Dictionary } from 'ts-essentials'

const KbLink = (
  <AppLink sx={{ color: 'critical100' }} href="https://kb.oasis.app/help/minimum-vault-debt-dust" />
)

interface VaultErrorsProps {
  errorMessages: VaultErrorMessage[]
  maxGenerateAmount?: BigNumber
  ilkData: IlkData
  maxWithdrawAmount?: BigNumber
}

export function VaultErrors({
  errorMessages,
  maxGenerateAmount = zero,
  maxWithdrawAmount = zero,
  ilkData: { debtFloor, token },
}: VaultErrorsProps) {
  const { t } = useTranslation()
  if (!errorMessages.length) return null

  function applyErrorMessageTranslation(message: VaultErrorMessage) {
    const translate = (key: string, args?: Dictionary<any>) => t(`vault-errors.${key}`, args)
    switch (message) {
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
      case 'afterCollRatioBelowBasicSellRatio':
        return translate('after-coll-ratio-below-basic-sell-ratio')
      case 'afterCollRatioAboveBasicBuyRatio':
        return translate('after-coll-ratio-above-basic-buy-ratio')
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
