import { AppLink } from 'components/Links'
import { MessageCard } from 'components/MessageCard'
import { formatCryptoBalance } from 'helpers/formatters/format'
import { UnreachableCaseError } from 'helpers/UnreachableCaseError'
import { Trans, useTranslation } from 'next-i18next'
import React from 'react'
import { Dictionary } from 'ts-essentials'

import { ManageMultiplyVaultState } from '../manageMultiplyVault'
import { ManageVaultErrorMessage } from '../manageMultiplyVaultValidations'

export function ManageMultiplyVaultErrors({
  errorMessages,
  maxWithdrawAmount,
  maxGenerateAmount,
  ilkData: { debtFloor },
  vault: { token },
}: ManageMultiplyVaultState) {
  const { t } = useTranslation()
  if (!errorMessages.length) return null

  function applyErrorMessageTranslation(message: ManageVaultErrorMessage) {
    const translate = (key: string, args?: Dictionary<any>) => t(`manage-vault.errors.${key}`, args)
    switch (message) {
      case 'depositAmountExceedsCollateralBalance':
        return translate('deposit-amount-exceeds-collateral-balance')
      case 'withdrawAmountExceedsFreeCollateral':
        return translate('withdraw-amount-exceeds-free-collateral', {
          maxWithdrawAmount: formatCryptoBalance(maxWithdrawAmount),
          token,
        })
      case 'withdrawAmountExceedsFreeCollateralAtNextPrice':
        return translate('withdraw-amount-exceeds-free-collateral-at-next-price', {
          maxWithdrawAmount: formatCryptoBalance(maxWithdrawAmount),
          token,
        })
      case 'generateAmountExceedsDaiYieldFromTotalCollateral':
        return translate('generate-amount-exceeds-dai-yield-from-total-collateral')
      case 'generateAmountExceedsDaiYieldFromTotalCollateralAtNextPrice':
        return translate('generate-amount-exceeds-dai-yield-from-total-collateral-at-next-price')
      case 'generateAmountExceedsDebtCeiling':
        return translate('generate-amount-exceeds-debt-ceiling', {
          maxGenerateAmount: formatCryptoBalance(maxGenerateAmount),
          token,
        })
      case 'generateAmountLessThanDebtFloor':
        return (
          <Trans
            i18nKey="manage-vault.errors.generate-amount-less-than-debt-floor"
            values={{ debtFloor: formatCryptoBalance(debtFloor) }}
            components={[
              <AppLink
                sx={{ color: 'onError' }}
                href="https://kb.oasis.app/help/minimum-vault-debt-dust"
              />,
            ]}
          />
        )
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
      case 'depositingAllEthBalance':
        return translate('depositing-all-eth-balance')
      case 'ledgerWalletContractDataDisabled':
        return translate('ledger-enable-contract-data')
      case 'exchangeError':
        return translate('exchange-error')
      case 'withdrawCollateralOnVaultUnderDebtFloor':
        return (
          <Trans
            i18nKey="manage-vault.errors.withdraw-collateral-on-vault-under-debt-floor"
            values={{ debtFloor: formatCryptoBalance(debtFloor) }}
            components={[
              <AppLink
                sx={{ color: 'onError' }}
                href="https://kb.oasis.app/help/minimum-vault-debt-dust"
              />,
            ]}
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

  return <MessageCard {...{ messages, type: 'error' }} />
}
