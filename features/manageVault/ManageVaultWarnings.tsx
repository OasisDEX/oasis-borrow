import { formatCryptoBalance } from 'helpers/formatters/format'
import { UnreachableCaseError } from 'helpers/UnreachableCaseError'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Card, Flex, Grid, Text } from 'theme-ui'
import { Dictionary } from 'ts-essentials'
import { ManageVaultState } from './manageVault'
import { ManageVaultWarningMessage } from './manageVaultValidations'

export function manageVaultWarningMessageTranslations({
  warningMessages,
  ilkData: { debtFloor },
}: ManageVaultState) {
  const { t } = useTranslation()

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

  return warningMessages.reduce(
    (acc, message) => [...acc, applyWarningMessageTranslation(message)],
    [] as string[],
  )
}

export function ManageVaultWarnings(props: ManageVaultState) {
  const { warningMessages } = props
  if (!warningMessages.length) return null

  const warningMessagesTranslations = manageVaultWarningMessageTranslations(props)
  return (
    <Card variant="warning">
      <Grid>
        {warningMessagesTranslations.map((message) => (
          <Flex>
            <Text pr={2} sx={{ fontSize: 2, color: 'onWarning' }}>
              •
            </Text>
            <Text sx={{ fontSize: 2, color: 'onWarning' }}>{message}</Text>
          </Flex>
        ))}
      </Grid>
    </Card>
  )
}
