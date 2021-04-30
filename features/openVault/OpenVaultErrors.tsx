import { formatCryptoBalance } from 'helpers/formatters/format'
import { UnreachableCaseError } from 'helpers/UnreachableCaseError'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Card, Flex, Grid, Text } from 'theme-ui'
import { Dictionary } from 'ts-essentials'

import { OpenVaultState } from './openVault'
import { OpenVaultErrorMessage } from './openVaultValidations'

function openVaultErrorMessageTranslations({
  errorMessages,
  ilkData: { debtFloor },
  maxGenerateAmount,
  token,
}: OpenVaultState) {
  const { t } = useTranslation()

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

  return errorMessages.reduce(
    (acc, message) => [...acc, applyErrorMessageTranslation(message)],
    [] as string[],
  )
}

export function OpenVaultErrors(props: OpenVaultState) {
  const { errorMessages } = props
  if (!errorMessages.length) return null

  const errorMessagesTranslations = openVaultErrorMessageTranslations(props)
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
