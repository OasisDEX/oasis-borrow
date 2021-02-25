// @ts-ignore
import { Icon } from '@makerdao/dai-ui-icons'
import { useAppContext } from 'components/AppContextProvider'
import { ConnectWallet, getConnectionKindMessage } from 'components/connectWallet/ConnectWallet'
import { AppLink } from 'components/Links'
import { Modal, ModalCloseIcon } from 'components/Modal'
import { formatAddress } from 'helpers/formatters/format'
import { ModalProps, useModal } from 'helpers/modalHook'
import { useObservable } from 'helpers/observableHook'
import { useTranslation } from 'i18n'
import React, { useEffect, useRef, useState } from 'react'
// @ts-ignore
import Jazzicon, { jsNumberForAddress } from 'react-jazzicon'
import { animated, useSpring } from 'react-spring'
import { TRANSITIONS } from 'theme'
import { Box, Button, Card, Flex, Grid, Heading, Text, Textarea } from 'theme-ui'

import { NotificationTransaction, TxMgrTransaction } from './transactionManager'
import {
  describeTxNotificationStatus,
  PendingTransactions,
  RecentTransactions,
} from './TransactionManagerView'
import { getTransactionTranslations } from './transactionTranslations'

export function AccountIndicator({
  chainId,
  address,
  transaction,
}: {
  chainId: number
  address: string
  transaction: NotificationTransaction | undefined
}) {
  let color = 'networks.default'
  if (chainId === 1) {
    color = 'networks.mainnet'
  }
  if (chainId === 42) {
    color = 'networks.kovan'
  }
  const { icon } = describeTxNotificationStatus(transaction?.tx)

  return (
    <Flex sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
      {icon ? <Flex>{icon}</Flex> : <Text sx={{ color, fontSize: '7px' }}>⬤</Text>}

      <Text ml={2}>{formatAddress(address)}</Text>
    </Flex>
  )
}

const buttonMinWidth = '150px'

function NotificationContent({
  isVisible,
  transaction,
}: {
  isVisible: boolean
  transaction?: TxMgrTransaction
}) {
  const props = useSpring({
    transform: isVisible ? 'translateX(0%)' : 'translateX(105%)',
  })

  const [tx, setTx] = useState<TxMgrTransaction>()

  useEffect(() => {
    if (transaction) {
      setTx(transaction)
    }
  }, [transaction])

  return (
    <animated.div style={{ ...props, display: 'flex', maxWidth: `calc(100% - ${buttonMinWidth})` }}>
      <Card
        sx={{
          p: 2,
          pl: 3,
          m: 0,
          borderRadius: 'round',
          minWidth: `calc(100% + ${buttonMinWidth})`,
          alignSelf: 'flex-end',
          height: '100%',
          borderColor: 'light',
          bg: 'txManagerBg',
          boxShadow: 'txManager',
        }}
      >
        <Text
          variant="text"
          sx={{
            whiteSpace: 'nowrap',
            maxWidth: `calc(100% - ${buttonMinWidth})`,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            svg: {
              flexShrink: 0,
            },
          }}
          py={1}
        >
          {tx ? getTransactionTranslations(tx).notification : null}
        </Text>
      </Card>
    </animated.div>
  )
}

export function AccountButton() {
  const { transactionManager$, web3Context$ } = useAppContext()
  const web3Context = useObservable(web3Context$)
  const { t } = useTranslation('common')
  const transactions = useObservable(transactionManager$)
  const transaction = transactions?.notificationTransaction
  const [isVisible, setIsVisible] = useState(false)
  const openModal = useModal()

  useEffect(() => {
    if (transaction && !isVisible) {
      setIsVisible(true)
    } else if (!transaction && isVisible) {
      setIsVisible(false)
    }
  }, [transaction])

  if (web3Context?.status === 'connected') {
    return (
      <Flex sx={{ justifyContent: 'flex-end', minWidth: 'auto', width: '100%' }}>
        <Flex>
          <NotificationContent isVisible={isVisible} transaction={transaction?.tx} />
          <Button
            variant="square"
            sx={{ fontWeight: 'body', minWidth: buttonMinWidth, zIndex: 1 }}
            onClick={() => openModal(AccountModal)}
          >
            <AccountIndicator
              chainId={web3Context.chainId}
              address={web3Context.account}
              transaction={transaction}
            />
          </Button>
        </Flex>
      </Flex>
    )
  }

  return (
    <AppLink href="/connect" variant="nav">
      {t('connect-wallet-button')}
    </AppLink>
  )
}

export function ConnectModal({ close }: ModalProps) {
  return (
    <Modal sx={{ width: 'max-content' }} variant="container">
      <ModalCloseIcon {...{ close }} />
      <ConnectWallet />
    </Modal>
  )
}

export function AccountModal({ close }: ModalProps) {
  const { web3Context$ } = useAppContext()
  const web3Context = useObservable(web3Context$)
  const clipboardContentRef = useRef<HTMLTextAreaElement>(null)
  const { t } = useTranslation('common')

  function disconnect() {
    if (web3Context?.status === 'connected') {
      web3Context.deactivate()
    }
    close()
    // for some reason queueing redirect is necessary
    setTimeout(() => {
      //replace(`/dashboard`)
    }, 0)
  }

  function copyToClipboard() {
    const clipboardContent = clipboardContentRef.current

    if (clipboardContent) {
      clipboardContent.select()
      document.execCommand('copy')
    }
  }

  if (web3Context?.status !== 'connected') return null

  const { account, connectionKind } = web3Context

  return (
    <Modal>
      <ModalCloseIcon {...{ close }} />
      <Grid gap={2} pt={3} mt={1}>
        <Box
          px={3}
          mx={1}
          sx={{
            '&:last-child': {
              pb: 3,
              mb: 1,
            },
          }}
        >
          <Heading mb={3}>{t('account')}</Heading>
          <Card variant="secondary">
            <Grid>
              <Flex sx={{ justifyContent: 'space-between' }}>
                {connectionKind === 'network' ? (
                  <Text sx={{ fontWeight: 'semiBold' }}>{t('connected-in-readonly-mode')}</Text>
                ) : (
                  <Text sx={{ fontWeight: 'semiBold' }}>
                    {t('connected-with', {
                      connectionKind: getConnectionKindMessage(connectionKind),
                    })}
                  </Text>
                )}
              </Flex>
              <Flex sx={{ alignItems: 'center' }}>
                <Box mr={2}>
                  <Jazzicon diameter={28} seed={jsNumberForAddress(account)} />
                </Box>
                <Text sx={{ fontSize: 5, mx: 1 }}>{formatAddress(account)}</Text>
                <Icon
                  name="copy"
                  sx={{
                    ml: 2,
                    cursor: 'pointer',
                    color: 'mutedAlt',
                    transition: TRANSITIONS.global,
                    '&:hover': { color: 'primaryEmphasis' },
                  }}
                  onClick={() => copyToClipboard()}
                />
                {/* Textarea element used for copy to clipboard using native API, custom positioning outside of screen */}
                <Textarea
                  ref={clipboardContentRef}
                  sx={{ position: 'absolute', top: '-1000px', left: '-1000px' }}
                  value={account}
                  readOnly
                />
              </Flex>
              <Flex>
                <AppLink
                  sx={{ mr: 3 }}
                  onClick={close}
                  href="/owner/[address]"
                  as={`/owner/${account}`}
                >
                  {t('my-page')}
                </AppLink>
                <Button
                  variant="textual"
                  sx={{
                    textAlign: 'left',
                    p: 0,
                    verticalAlign: 'baseline',
                  }}
                  onClick={disconnect}
                >
                  {t(`disconnect${connectionKind === 'magicLink' ? '-magic' : ''}`)}
                </Button>
              </Flex>
            </Grid>
          </Card>
        </Box>
        <Flex
          sx={{
            fontWeight: 'semiBold',
            px: 3,
            my: 2,
            mx: 1,
          }}
        >
          <AppLink
            sx={{ color: 'primary', mr: 3 }}
            withAccountPrefix={false}
            href="/terms"
            onClick={close}
          >
            {t('account-terms')}
          </AppLink>
          <AppLink
            sx={{ color: 'primary', mr: 3 }}
            withAccountPrefix={false}
            href="/privacy"
            onClick={close}
          >
            {t('account-privacy')}
          </AppLink>
          <AppLink
            sx={{ color: 'primary' }}
            withAccountPrefix={false}
            href="/support"
            onClick={close}
          >
            {t('account-support')}
          </AppLink>
        </Flex>
        <PendingTransactions />
        <RecentTransactions />
      </Grid>
    </Modal>
  )
}
