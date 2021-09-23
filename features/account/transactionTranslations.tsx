import { TxState } from '@oasisdex/transactions'
import { TxMetaKind } from 'blockchain/calls/txMeta'
import { TxData } from 'components/AppContext'
import React from 'react'

import { TxMgrTransaction, TxTranslator } from './transactionManager'

const MISSING_TRANSLATIONS = {
  pending: 'missing translation description pending',
  recent: 'missing translation description recent',
  recentFailed: 'missing translation description recent failed',
  notification: 'missing translation notification',
  notificationPast: 'missing translation notification past',
}

function getTranslations(txPrefix: string, params: { [key: string]: any }) {
  return {
    pending: <TxTranslator i18nKey={`${txPrefix}-description-pending`} params={params} />,
    recent: <TxTranslator i18nKey={`${txPrefix}-description-recent`} params={params} />,
    recentFailed: (
      <TxTranslator i18nKey={`${txPrefix}-description-recent-failed`} params={params} />
    ),
    notification: <TxTranslator i18nKey={`${txPrefix}-notification`} params={params} />,
    notificationPast: <TxTranslator i18nKey={`${txPrefix}-notification-past`} params={params} />,
  }
}

export function getTransactionTranslations(tx: TxMgrTransaction) {
  const { kind, raw } = tx
  if (kind === 'blockchain') {
    const { meta } = raw as TxState<TxData>

    switch (meta.kind) {
      case TxMetaKind.createDsProxy:
        return getTranslations('create-ds-proxy', meta)
      case TxMetaKind.setProxyOwner:
        return getTranslations('set-proxy-owner', meta)
      case TxMetaKind.approve:
        return getTranslations('erc20-approve', meta)
      case TxMetaKind.disapprove:
        return getTranslations('erc20-disapprove', meta)
      case TxMetaKind.open:
        return getTranslations('open-vault', meta)
      case TxMetaKind.depositAndGenerate:
        return getTranslations('deposit-generate', meta)
      case TxMetaKind.withdrawAndPayback:
        return getTranslations('withdraw-payback', meta)
      case TxMetaKind.reclaim:
        return getTranslations('reclaim-collateral', meta)
      case TxMetaKind.multiply:
        return getTranslations('multiply', meta)
      case TxMetaKind.adjustPosition:
        return getTranslations('adjust-position', meta)
      case TxMetaKind.closeVault:
        return getTranslations('close-vault', meta)
      default:
        return MISSING_TRANSLATIONS
    }
  }

  return MISSING_TRANSLATIONS
}
