import { MessageCard } from 'components/MessageCard'
import { formatCryptoBalance } from 'helpers/formatters/format'
import { UnreachableCaseError } from 'helpers/UnreachableCaseError'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Dictionary } from 'ts-essentials'

import { OpenVaultState } from './openVault'
import { OpenVaultErrorMessage } from './openVaultValidations'

export function OpenVaultErrors({
  errorMessages,
  maxGenerateAmount,
  ilkData: { debtFloor },
  token,
}: OpenVaultState) {
  const { t } = useTranslation()
  if (!errorMessages.length) return null

  function applyErrorMessageTranslation(message: OpenVaultErrorMessage) {
    const translate = (key: string, args?: Dictionary<any>) => t(`open-vault.errors.${key}`, args)
    switch (message) {
      case 'depositAmountExceedsCollateralBalance':
        return translate('deposit-amount-exceeds-collateral-balance')
      case 'generateAmountExceedsDaiYieldFromDepositingCollateral':
        return translate('generate-amount-exceeds-dai-yield-from-depositing-collateral')
      case 'generateAmountExceedsDaiYieldFromDepositingCollateralAtNextPrice':
        return translate(
          'generate-amount-exceeds-dai-yield-from-depositing-collateral-at-next-price',
        )
      case 'generateAmountExceedsDebtCeiling':
        return translate('generate-amount-exceeds-debt-ceiling', {
          maxGenerateAmount: formatCryptoBalance(maxGenerateAmount),
          token,
        })
      case 'generateAmountLessThanDebtFloor':
        return translate('generate-amount-less-than-debt-floor', {
          debtFloor: formatCryptoBalance(debtFloor),
          link: 'xx INSERT LINK HERE xx',
        })
      case 'customAllowanceAmountExceedsMaxUint256':
        return translate('custom-allowance-amount-exceeds-maxuint256')
      case 'customAllowanceAmountLessThanDepositAmount':
        return translate('custom-allowance-amount-less-than-deposit-amount')
      case 'depositingAllEthBalance':
        return translate('depositing-all-eth-balance')
      default:
        throw new UnreachableCaseError(message)
    }
  }

  const messages = errorMessages.reduce(
    (acc, message) => [...acc, applyErrorMessageTranslation(message)],
    [] as string[],
  )

  return <MessageCard {...{ messages, type: 'error' }} />
}
