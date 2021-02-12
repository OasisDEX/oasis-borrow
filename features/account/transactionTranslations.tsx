// @ts-ignore
import { TxState } from '@oasisdex/transactions'
import { TxMetaKind } from 'blockchain/calls/txMeta'
import { TxData } from 'components/AppContext'
import React from 'react'

import { TxMgrTransaction, TxTranslator } from './transactionManager'

export function getTransactionTranslations(tx: TxMgrTransaction) {
  const { kind, raw } = tx
  if (kind === 'blockchain') {
    const { meta } = raw as TxState<TxData>

    switch (meta.kind) {
      case TxMetaKind.approve:
        return {
          pending: (
            <TxTranslator
              i18nKey="erc20-approve-description-pending"
              params={{ token: meta.token }}
            />
          ),
          recent: (
            <TxTranslator
              i18nKey="erc20-approve-description-recent"
              params={{ token: meta.token }}
            />
          ),
          recentFailed: (
            <TxTranslator
              i18nKey="erc20-approve-description-recent-failed"
              params={{ token: meta.token }}
            />
          ),
          notification: (
            <TxTranslator i18nKey="erc20-approve-notification" params={{ token: meta.token }} />
          ),
          notificationPast: (
            <TxTranslator
              i18nKey="erc20-approve-notification-past"
              params={{ token: meta.token }}
            />
          ),
        }
      case TxMetaKind.disapprove:
        return {
          pending: (
            <TxTranslator
              i18nKey="erc20-disapprove-description-pending"
              params={{ token: meta.token }}
            />
          ),
          recent: (
            <TxTranslator
              i18nKey="erc20-disapprove-description-recent"
              params={{ token: meta.token }}
            />
          ),
          recentFailed: (
            <TxTranslator
              i18nKey="erc20-disapprove-description-recent-failed"
              params={{ token: meta.token }}
            />
          ),
          notification: (
            <TxTranslator i18nKey="erc20-disapprove-notification" params={{ token: meta.token }} />
          ),
          notificationPast: (
            <TxTranslator
              i18nKey="erc20-disapprove-notification-past"
              params={{ token: meta.token }}
            />
          ),
        }
      default:
        return {
          pending: 'missing translation description pending',
          recent: 'missing translation description recent',
          recentFailed: 'missing translation description recent failed',
          notification: 'missing translation notification',
          notificationPast: 'missing translation notification past',
        }
    }
  }

  return {
    pending: 'missing translation description pending',
    recent: 'missing translation description recent',
    recentFailed: 'missing translation description recent failed',
    notification: 'missing translation notification',
    notificationPast: 'missing translation notification past',
  }
}
