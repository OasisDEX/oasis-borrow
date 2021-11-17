import BigNumber from 'bignumber.js'
import { FLASH_MINT_LIMIT_PER_TX } from 'components/constants'
import { AppLink } from 'components/Links'
import { MessageCard } from 'components/MessageCard'
import { formatCryptoBalance } from 'helpers/formatters/format'
import { UnreachableCaseError } from 'helpers/UnreachableCaseError'
import { Trans, useTranslation } from 'next-i18next'
import React from 'react'
import { Dictionary } from 'ts-essentials'

import { IlkData } from '../../blockchain/ilks'
import { Vault } from '../../blockchain/vaults'
import { VaultErrorMessage } from '../../features/openMultiplyVault/openMultiplyVaultValidations'
import { zero } from '../../helpers/zero'

interface VaultErrorsProps {
  errorMessages: VaultErrorMessage[]
  maxGenerateAmount: BigNumber
  ilkData: IlkData
  vault?: Vault
  maxWithdrawAmount?: BigNumber
}

export function VaultErrors({
  errorMessages,
  maxGenerateAmount,
  maxWithdrawAmount = zero,
  ilkData: { debtFloor },
  vault,
}: VaultErrorsProps) {
  const { t } = useTranslation()
  if (!errorMessages.length) return null

  function applyErrorMessageTranslation(message: VaultErrorMessage) {
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
      case 'generateAmountMoreThanMaxFlashAmount':
        return translate('generate-amount-more-than-max-flash-amount', {
          maxFlashAmount: FLASH_MINT_LIMIT_PER_TX.toFormat(0),
        })
      case 'generateAmountLessThanDebtFloor':
        return (
          <Trans
            i18nKey="open-vault.errors.generate-amount-less-than-debt-floor"
            values={{ debtFloor: formatCryptoBalance(debtFloor) }}
            components={[
              <AppLink
                sx={{ color: 'onError' }}
                href="https://community-development.makerdao.com/en/learn/governance/param-debt-floor/"
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
      case 'exchangeError':
        return translate('exchange-error')
      case 'withdrawAmountExceedsFreeCollateral':
        return translate('withdraw-amount-exceeds-free-collateral', {
          maxWithdrawAmount: formatCryptoBalance(maxWithdrawAmount),
          token: vault?.token,
        })
      case 'withdrawAmountExceedsFreeCollateralAtNextPrice':
        return translate('withdraw-amount-exceeds-free-collateral-at-next-price', {
          maxWithdrawAmount: formatCryptoBalance(maxWithdrawAmount),
          token: vault?.token,
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
