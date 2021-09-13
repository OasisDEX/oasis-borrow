import { MessageCard } from 'components/MessageCard'
import { formatCryptoBalance } from 'helpers/formatters/format'
import { UnreachableCaseError } from 'helpers/UnreachableCaseError'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Dictionary } from 'ts-essentials'

import { ManageMultiplyVaultState } from '../manageMultiplyVault'
import { ManageVaultWarningMessage } from '../manageMultiplyVaultValidations'

export function ManageMultiplyVaultWarnings({
  warningMessages,
  ilkData: { debtFloor },
}: ManageMultiplyVaultState) {
  const { t } = useTranslation()
  if (!warningMessages.length) return null

  function applyWarningMessageTranslation(message: ManageVaultWarningMessage) {
    const translate = (key: string, args?: Dictionary<any>) =>
      t(`manage-vault.warnings.${key}`, args)
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
      default:
        throw new UnreachableCaseError(message)
    }
  }

  const messages = warningMessages.reduce(
    (acc, message) => [...acc, applyWarningMessageTranslation(message)],
    [] as (string | JSX.Element)[],
  )

  return <MessageCard {...{ messages, type: 'warning' }} />
}
