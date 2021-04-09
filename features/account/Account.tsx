// @ts-ignore
import { Icon } from '@makerdao/dai-ui-icons'
import BigNumber from 'bignumber.js'
import { useAppContext } from 'components/AppContextProvider'
import { ConnectWallet, getConnectionKindMessage } from 'components/connectWallet/ConnectWallet'
import { AppLink } from 'components/Links'
import { Modal, ModalCloseIcon } from 'components/Modal'
import { formatAddress, formatCryptoBalance } from 'helpers/formatters/format'
import { ModalProps, useModal } from 'helpers/modalHook'
import { useObservable } from 'helpers/observableHook'
import { useTranslation } from 'next-i18next'
import React, { useRef } from 'react'
// @ts-ignore
import Jazzicon, { jsNumberForAddress } from 'react-jazzicon'
import { animated, useSpring } from 'react-spring'
import { TRANSITIONS } from 'theme'
import { Box, Button, Card, Flex, Grid, Heading, Text, Textarea } from 'theme-ui'

import {
  PendingTransactions,
  RecentTransactions,
} from './TransactionManagerView'

function DaiIndicator({ daiBalance }: { daiBalance: BigNumber | undefined }) {
  return (
    <Flex
      sx={{
        position: 'relative',
        alignItems: 'center',
        bg: 'warning',
        borderRadius: 'round',
        p: 1
      }}>
      <Icon sx={{ zIndex: 1 }} name="dai_circle_color" size={30} />
      <Box sx={{ mx: 2, color: 'onWarning' }}>
        {
          daiBalance ? formatCryptoBalance(daiBalance) : '0.00'
        }
      </Box>
    </Flex>
  )
}
export function AccountIndicator({
  address,
}: {
  address: string
}) {
  return (
    <Flex sx={{ alignItems: 'center', justifyContent: 'space-between', mx: 3 }}>
      <Text variant="paragraph4" sx={{ fontWeight: 'bold' }}>
        {formatAddress(address)}
      </Text>
    </Flex>
  )
}

const buttonMinWidth = '150px'

export function AccountButton() {
  const { accountData$ } = useAppContext()
  const accountData = useObservable(accountData$)
  const { t } = useTranslation('common')
  const openModal = useModal()
  const animatedProps = useSpring({
    top: accountData === undefined ? -100 : 0
  })

  if (accountData?.context.status === 'connecting' || accountData === undefined) {
    return null
  }

  if (accountData.context.status === 'connected') {
    return (
      <Flex
        as={animated.div}
        style={animatedProps}
        sx={{
          position: 'relative',
          justifyContent: 'flex-end',
          minWidth: 'auto',
        }}>
        <Button
          variant="secondary"
          sx={{
            minWidth: buttonMinWidth,
            zIndex: 1,
            background: 'white',
            boxShadow: 'surface',
            p: 1,
            display: 'flex',
            alignItems: 'center'
          }}
          onClick={() => openModal(AccountModal)}
        >
          <AccountIndicator address={accountData.context.account} />
          <DaiIndicator daiBalance={accountData.daiBalance} />
        </Button>
      </Flex>
    )
  }

  return (
    <AppLink sx={{ zIndex: 1 }} href="/connect" variant="nav">
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
