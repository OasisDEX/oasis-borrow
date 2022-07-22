/* eslint-disable @typescript-eslint/no-unused-vars */

import { Icon } from '@makerdao/dai-ui-icons'
import { TxMeta, TxState, TxStatus } from '@oasisdex/transactions'
import { ActivityItem } from 'components/Activity'
import { TxData } from 'components/AppContext'
import { useAppContext } from 'components/AppContextProvider'
import { ViewMore } from 'components/ViewMore'
import { useObservable } from 'helpers/observableHook'
import { UnreachableCaseError } from 'helpers/UnreachableCaseError'
import { useTranslation } from 'next-i18next'
import React, { useState } from 'react'
import { Box, Button, Flex, Grid, Heading, Link, Spinner } from 'theme-ui'

import { TxMgrTransaction } from './transactionManager'
import { getTransactionTranslations } from './transactionTranslations'

export interface TransactionProps<A extends TxMeta> {
  transaction?: TxMgrTransaction
}

export const ICONS = {
  initialized: <Icon name="dots_h" />,
  sign: <Icon name="sign_transaction" />,
  pending: (
    <Spinner
      variant="styles.spinner.large"
      sx={{
        color: 'spinnerWarning',
        boxSizing: 'content-box',
      }}
    />
  ),
  complete: <Icon name="checkmark" color="success100" />,
  error: <Icon name="close" color="critical100" />,
  expired: <Icon name="clock" color="critical100" size={20} />,
  warning: <Icon name="warning" color="warning100" size={24} />,
}

export function describeTxNotificationStatus(tx?: TxMgrTransaction) {
  if (!tx) {
    return { icon: undefined, keySuffix: undefined }
  }

  switch (tx.status) {
    // statuses from Wallet
    case TxStatus.WaitingForApproval:
      return { icon: ICONS.sign, keySuffix: 'sign' }
    case TxStatus.Propagating:
    case TxStatus.WaitingForConfirmation:
      return { icon: ICONS.pending, keySuffix: 'pending' }
    case TxStatus.Error:
    case TxStatus.Failure:
      return { icon: ICONS.error, keySuffix: 'failed' }
    case TxStatus.CancelledByTheUser:
      return { icon: ICONS.error, keySuffix: 'rejected' }
    case TxStatus.Success:
      return { icon: ICONS.complete, keySuffix: 'complete' }
    default:
      throw new UnreachableCaseError(tx.status)
  }
}

const TRANSACTIONS_INCREMENT = 3

const ICONS_RECENT_TRANSACTIONS = {
  error: <Icon name="close" size="14px" />,
  sent: <Icon name="send" size="14px" sx={{ position: 'relative', top: '-2px' }} />,
  moonpay: <Icon name="moonpay" size="14px" />,
  wyre: <Icon name="wyre" size="16px" />,
  dsrDeposit: <Icon name="arrow_down" size="14px" />,
  dsrWithdraw: <Icon name="arrow_up_thin" size="14px" />,
}

export function getRecentTransactionIcon(tx: TxMgrTransaction) {
  const { kind, raw } = tx
  if (kind === 'blockchain') {
    const { meta } = raw as TxState<TxData>

    switch (meta.kind) {
      // case TxMetaKind.dsrJoin:
      //   return ICONS_RECENT_TRANSACTIONS.dsrDeposit
      // case TxMetaKind.dsrExit:
      //   return ICONS_RECENT_TRANSACTIONS.dsrWithdraw
      default:
        return ICONS_RECENT_TRANSACTIONS.sent
    }
  } else if (kind === 'wyre') {
    return ICONS_RECENT_TRANSACTIONS.wyre
  } else if (kind === 'moonpay') {
    return ICONS_RECENT_TRANSACTIONS.moonpay
  } else {
    return ICONS_RECENT_TRANSACTIONS.sent
  }
}

function PendingTransaction<A extends TxMeta>({
  transaction,
  etherscan: { url },
}: {
  transaction: TxMgrTransaction
  etherscan: { url: string }
}) {
  const { raw, kind, status } = transaction
  const { t } = useTranslation()

  return (
    <Flex sx={{ alignItems: 'center', mb: 3, justifyContent: 'space-between' }}>
      <Flex sx={{ flex: 1, alignItems: 'center' }}>
        <Flex sx={{ alignItems: 'center', pr: 2, mr: 1 }}>
          {status === TxStatus.WaitingForApproval ? ICONS.sign : ICONS.pending}
        </Flex>
        <Box sx={{ flex: 1 }}>{getTransactionTranslations(transaction).pending}</Box>
      </Flex>
      {kind === 'blockchain' && (raw as any).txHash && (
        <Link href={`${url}/tx/${(raw as any).txHash}`} target="_blank" rel="noopener noreferrer">
          <Button variant="secondarySmall" sx={{ ml: 1 }}>
            <Flex sx={{ alignItems: 'center' }}>
              {t('view')}
              <Icon name="increase" sx={{ ml: 1 }} size={12} />
            </Flex>
          </Button>
        </Link>
      )}
    </Flex>
  )
}

function RecentTransaction<A extends TxMeta>({ transaction }: { transaction: TxMgrTransaction }) {
  const { lastChange, status } = transaction
  const isFailed =
    status === TxStatus.CancelledByTheUser ||
    status === TxStatus.Error ||
    status === TxStatus.Failure
  const label = getTransactionTranslations(transaction)[isFailed ? 'recentFailed' : 'recent']

  return (
    <ActivityItem
      {...{
        timestamp: lastChange,
        label,
        icon: isFailed ? ICONS_RECENT_TRANSACTIONS.error : getRecentTransactionIcon(transaction),
        iconColor: 'primary60',
      }}
    />
  )
}

export function PendingTransactions() {
  const { transactionManager$, context$ } = useAppContext()
  const [transactions] = useObservable(transactionManager$)
  const pendingTransactions = transactions?.pendingTransactions
  const [context] = useObservable(context$)
  const [transactionsCount, setTransactionsCount] = useState(TRANSACTIONS_INCREMENT)
  const { t } = useTranslation()

  function viewMore() {
    setTransactionsCount(transactionsCount + TRANSACTIONS_INCREMENT)
  }

  if (!context || !pendingTransactions || !pendingTransactions.length) return null
  const { etherscan } = context

  return (
    <Grid>
      <Heading px={3} mx={1}>
        {t('pending-transactions')}
      </Heading>
      <Box px={3} mx={1}>
        {pendingTransactions.slice(0, transactionsCount).map((transaction) => (
          <PendingTransaction {...{ transaction, etherscan, key: transaction.id }} />
        ))}
      </Box>
      {transactionsCount < pendingTransactions.length && <ViewMore viewMore={viewMore} />}
    </Grid>
  )
}

export function RecentTransactions() {
  const { transactionManager$, context$ } = useAppContext()
  const [transactions] = useObservable(transactionManager$)
  const recentTransactions = transactions?.recentTransactions
  const [context] = useObservable(context$)
  const [transactionsCount, setTransactionsCount] = useState(TRANSACTIONS_INCREMENT)
  const { t } = useTranslation()

  function viewMore() {
    setTransactionsCount(transactionsCount + TRANSACTIONS_INCREMENT)
  }

  if (!context || !recentTransactions || !recentTransactions.length) return null
  const { etherscan } = context

  return (
    <Grid>
      <Heading px={3} mx={1}>
        {t('recent-transactions')}
      </Heading>
      <Box px={3} mx={1}>
        {recentTransactions.slice(0, transactionsCount).map((transaction) => (
          <RecentTransaction {...{ transaction, etherscan, key: transaction.id }} />
        ))}
      </Box>
      {transactionsCount < recentTransactions.length && <ViewMore viewMore={viewMore} />}
    </Grid>
  )
}
