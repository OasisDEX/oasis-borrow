import { MessageCard } from 'components/MessageCard'
import { formatCryptoBalance } from 'helpers/formatters/format'
import { UnreachableCaseError } from 'helpers/UnreachableCaseError'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Dictionary } from 'ts-essentials'

import { IlkData } from '../../blockchain/ilks'
import { VaultWarningMessage } from '../../features/form/warningMessagesHandler'

interface VaultWarningsProps {
  warningMessages: VaultWarningMessage[]
  ilkData: IlkData
}

export function VaultWarnings({ warningMessages, ilkData: { debtFloor } }: VaultWarningsProps) {
  const { t } = useTranslation()
  if (!warningMessages.length) return null

  function applyWarningMessageTranslation(message: VaultWarningMessage) {
    const translate = (key: string, args?: Dictionary<any>) => t(`vault-warnings.${key}`, args)
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
      case 'highSlippage':
        return t('user-settings.slippage-limit.warnings.high-slippage')
      case 'customSlippageOverridden':
        return t('guni-slippage-overridden')
      case 'vaultIsCurrentlyUnderMinActiveColRatio':
        return translate('vault-is-currently-under-min-active-col-ratio')
      case 'vaultWillRemainUnderMinActiveColRatio':
        return translate('vault-will-remain-under-min-active-col-ratio')
      case 'potentialInsufficientEthFundsForTx':
        return translate('insufficient-eth-balance')
      case 'nextCollRatioCloseToCurrentSl':
        return translate('next-coll-ratio-close-to-current-stop-loss')
      default:
        throw new UnreachableCaseError(message)
    }
  }

  const messages = warningMessages.reduce(
    (acc, message) => [...acc, applyWarningMessageTranslation(message)],
    [] as (string | JSX.Element)[],
  )

  return <MessageCard {...{ messages, type: 'warning', withBullet: messages.length > 1 }} />
}
