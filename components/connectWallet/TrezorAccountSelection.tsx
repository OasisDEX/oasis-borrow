import { Icon } from '@makerdao/dai-ui-icons'
import {
  AccountWithBalances,
  Web3ContextConnecting,
  Web3ContextConnectingHWSelectAccount,
} from '@oasisdex/web3-context'
import { AppSpinner } from 'helpers/AppSpinner'
import { formatAddress, formatCryptoBalance } from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'
import React, { useEffect, useRef, useState } from 'react'
import { Box, Button, Flex, Grid, Heading, Text } from 'theme-ui'

type TrezorAccountSelectionProps = {
  web3Context: Web3ContextConnecting | Web3ContextConnectingHWSelectAccount
  cancel: () => void
}

export function TrezorAccountSelection({ web3Context, cancel }: TrezorAccountSelectionProps) {
  const { t } = useTranslation()
  const PageLength = 5
  const [page, setPage] = useState(1)
  const [accounts, setAccounts] = useState<AccountWithBalances[]>()
  const [loadingAccounts, setLoadingAccounts] = useState<boolean>(true)
  const [error, setError] = useState()
  const mountedRef = useRef(true)

  useEffect(() => {
    if (web3Context.status === 'connectingHWSelectAccount') {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      setLoadingAccounts(true)
      web3Context
        .getAccounts(page * PageLength)
        .then((accounts) => {
          if (mountedRef.current) {
            setAccounts(accounts)
            setLoadingAccounts(false)
          }
        })
        .catch((e) => mountedRef.current && setError(e))
    }
  }, [page, web3Context.status])

  useEffect(() => {
    return () => {
      cancel()
      mountedRef.current = false
    }
  }, [])

  if (error) {
    return (
      <Grid gap={4} sx={{ textAlign: 'center' }}>
        <Heading as="h1">{t('trezor-select-address')}</Heading>
        <Button onClick={cancel} variant="textual">
          {t('trezor-error')}
        </Button>
      </Grid>
    )
  }

  if (!accounts) {
    return <Grid>{t('trezor-loading-accounts')}</Grid>
  }

  return (
    <Grid gap={4} sx={{ textAlign: 'center' }}>
      <Heading as="h1">{t('trezor-select-address')}</Heading>
      <Grid gap={3}>
        {accounts!.map(({ address, ethAmount, daiAmount }, i) => (
          <Button
            disabled={loadingAccounts}
            key={address}
            variant="outlineSquare"
            onClick={() => {
              if (web3Context.status === 'connectingHWSelectAccount') {
                web3Context.selectAccount(address)
              }
            }}
          >
            <Grid columns={[2, '3fr 1fr']} sx={{ alignItems: 'center' }} px={2} py={1}>
              <Grid columns={[2, 'auto 1fr']} sx={{ alignItems: 'center' }}>
                <Box
                  sx={{
                    border: 'light',
                    borderRadius: '50%',
                    width: 4,
                    height: 4,
                    textAlign: 'center',
                  }}
                >
                  <Text sx={{ lineHeight: '32px', fontSize: 1 }}>{i + 1}</Text>
                </Box>
                <Grid gap={1} sx={{ textAlign: 'left' }}>
                  <Text variant="boldBody">{formatAddress(address)}</Text>
                  <Flex sx={{ justifyContent: 'space-between' }}>
                    <Text variant="surfaceText" mr={2} sx={{ fontSize: 3 }}>
                      {formatCryptoBalance(daiAmount)} DAI
                    </Text>
                    <Text variant="surfaceText" sx={{ fontSize: 3 }}>
                      {formatCryptoBalance(ethAmount)} ETH
                    </Text>
                  </Flex>
                </Grid>
              </Grid>
              <Box sx={{ textAlign: 'right' }}>
                <Icon name="chevron_right" size={12} />
              </Box>
            </Grid>
          </Button>
        ))}
      </Grid>

      {loadingAccounts ? (
        <Box sx={{ textAlign: 'center' }}>
          <AppSpinner size={22} />
        </Box>
      ) : (
        <Button onClick={() => setPage(page + 1)} variant="textual">
          {t('show-more')}
        </Button>
      )}
      <Button onClick={cancel} variant="textual">
        {t('trezor-cancel')}
      </Button>
    </Grid>
  )
}
