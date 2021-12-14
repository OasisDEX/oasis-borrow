import { AppLink } from 'components/Links'
import { MessageCard } from 'components/MessageCard'
import { formatCryptoBalance } from 'helpers/formatters/format'
import { pick } from 'helpers/pick'
import { UnreachableCaseError } from 'helpers/UnreachableCaseError'
import { useSelectFromContext } from 'helpers/useSelectFromContext'
import { Trans, useTranslation } from 'next-i18next'
import React from 'react'
import { Dictionary } from 'ts-essentials'

import { OpenVaultErrorMessage } from '../openVaultValidations'
import { OpenBorrowVaultContext } from './OpenVaultView'

export function OpenVaultErrors() {
  const { t } = useTranslation()

  const { errorMessages, maxGenerateAmount, debtFloor } = useSelectFromContext(
    OpenBorrowVaultContext,
    (ctx) => ({
      ...pick(ctx, 'errorMessages', 'maxGenerateAmount'),
      ...pick(ctx.ilkData, 'debtFloor'),
    }),
  )

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
        })
      case 'generateAmountLessThanDebtFloor':
        return (
          <Trans
            i18nKey="open-vault.errors.generate-amount-less-than-debt-floor"
            values={{ debtFloor: formatCryptoBalance(debtFloor) }}
            components={[
              <AppLink
                sx={{ color: 'onError' }}
                href="https://kb.oasis.app/help/minimum-vault-debt-dust"
              />,
            ]}
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
