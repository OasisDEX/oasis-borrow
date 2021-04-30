import { formatCryptoBalance } from 'helpers/formatters/format'
import { UnreachableCaseError } from 'helpers/UnreachableCaseError'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Card, Flex, Grid, Text } from 'theme-ui'
import { Dictionary } from 'ts-essentials'
import { ManageVaultState } from './manageVault'
import { ManageVaultErrorMessage } from './manageVaultValidations'

function manageVaultErrorMessageTranslations({
  errorMessages,
  ilkData: { debtFloor },
  maxWithdrawAmount,
  maxGenerateAmount,
  vault: { token },
}: ManageVaultState) {
  const { t } = useTranslation()

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
        return translate('generate-amount-less-than-debt-floor', {
          debtFloor: formatCryptoBalance(debtFloor),
          link: 'xx INSERT LINK HERE xx',
        })
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
      default:
        throw new UnreachableCaseError(message)
    }
  }

  return errorMessages.reduce(
    (acc, message) => [...acc, applyErrorMessageTranslation(message)],
    [] as string[],
  )
}

export function ManageVaultErrors(props: ManageVaultState) {
  const { errorMessages } = props
  if (!errorMessages.length) return null

  const errorMessagesTranslations = manageVaultErrorMessageTranslations(props)
  return (
    <Card variant="danger">
      <Grid>
        {errorMessagesTranslations.map((message) => (
          <Flex>
            <Text pr={2} sx={{ fontSize: 2, color: 'onError' }}>
              •
            </Text>
            <Text sx={{ fontSize: 2, color: 'onError' }}>{message}</Text>
          </Flex>
        ))}
      </Grid>
    </Card>
  )
}
