import { Icon } from '@makerdao/dai-ui-icons'
import { AccountWithBalances, Web3Context } from '@oasisdex/web3-context'
import { AppSpinner } from 'helpers/AppSpinner'
import { formatAddress, formatCryptoBalance } from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'
import React, { useEffect, useRef, useState } from 'react'
import { Box, Button, Flex, Grid, Heading, Text } from 'theme-ui'

type LedgerAccountSelectionProps = {
  chainId: number
  web3Context: Web3Context
  cancel: () => void
}

export function LedgerAccountSelection({
  chainId,
  web3Context,
  cancel,
}: LedgerAccountSelectionProps) {
  const { t } = useTranslation()
  const [derivPath, setDerivPath] = useState<string>()
  const PageLength = 5
  const [page, setPage] = useState(1)
  const [accounts, setAccounts] = useState<AccountWithBalances[]>()
  const [loadingAccounts, setLoadingAccounts] = useState<boolean>(false)
  const [error, setError] = useState()
  const mountedRef = useRef(true)

  function connectLedger(path: string) {
    if (web3Context.status === 'notConnected' || web3Context.status === 'connectedReadonly') {
      setDerivPath(path)
      return web3Context.connectLedger(chainId, path)
    }
    return null
  }

  const accountsLoaded = !!(accounts && accounts.length)
  const liveLoading =
    (web3Context.status === 'connecting' || web3Context.status === 'connectingHWSelectAccount') &&
    derivPath === LEDGER_LIVE_PATH &&
    !accountsLoaded
  const legacyLoading =
    (web3Context.status === 'connecting' || web3Context.status === 'connectingHWSelectAccount') &&
    derivPath === LEDGER_LEGACY_PATH &&
    !accountsLoaded

  useEffect(() => {
    if (web3Context.status === 'connectingHWSelectAccount') {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      setLoadingAccounts(true)
      web3Context
        .getAccounts(page * PageLength)
        .then((accounts) => {
          if (mountedRef.current) {
            setAccounts(accounts)
            setDerivPath(undefined)
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

  if (error || web3Context.status === 'error') {
    return (
      <Box
        sx={{
          textAlign: 'center',
        }}
      >
        <Heading
          as="h1"
          sx={{
            fontSize: '20px',
            color: 'primary',
            mb: 4,
            mt: '24px',
          }}
        >
          Oops, failed to connect *Ledger Legacy*
        </Heading>
        <Grid
          gap="24px"
          columns="1fr"
          sx={{
            textAlign: 'center',
            width: '100%',
            paddingLeft: 4,
            paddingRight: 4,
            justifyItems: 'center',
          }}
        >
          <Icon name="wallet_error_during_setup" size={62} />
          <Text variant="paragraph2" sx={{ color: 'lavender' }}>
            Something went wrong when connecting your Ledger.
            <br /> Please go back to connect your wallet again or try other wallets.
          </Text>
        </Grid>
        <Box sx={{ mt: '20px', borderTop: 'solid #EAEAEA 1px', textAlign: 'left' }}>
          <Text
            onClick={cancel}
            variant="links.inText"
            sx={{ fontSize: '14px', mt: '32px', mb: '32px', ml: '34px', cursor: 'pointer' }}
          >
            &lt;- {t('ledger-cancel')}
          </Text>
        </Box>
      </Box>
    )
  }

  return accountsLoaded ? (
    <Box
      sx={{
        textAlign: 'center',
      }}
    >
      <Heading
        as="h1"
        sx={{
          fontSize: '20px',
          color: 'primary',
          mb: 4,
          mt: '24px',
        }}
      >
        {t('ledger-select-address')}
      </Heading>
      <Grid
        gap="24px"
        columns="1fr"
        sx={{
          textAlign: 'center',
          width: '100%',
          paddingLeft: 4,
          paddingRight: 4,
        }}
      >
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
        {t('ledger-cancel')}
      </Button>
    </Box>
  ) : (
    <DerivationPathSelection {...{ connectLedger, liveLoading, legacyLoading, cancel }} />
  )
}

export const LEDGER_LIVE_PATH = "44'/60'/0'"
export const LEDGER_LEGACY_PATH = "44'/60'/0'/0"

function DerivationPathSelection({
  cancel,
  connectLedger,
  liveLoading,
  legacyLoading,
}: {
  cancel: () => void
  connectLedger: (x: string) => void
  liveLoading: boolean
  legacyLoading: boolean
}) {
  const { t } = useTranslation()
  return (
    <Box
      sx={{
        textAlign: 'center',
      }}
    >
      <Heading
        as="h1"
        sx={{
          fontSize: '20px',
          color: 'primary',
          mb: 4,
          mt: '24px',
        }}
      >
        {t('ledger-select-title')}
      </Heading>
      <Grid
        gap="24px"
        columns="1fr"
        sx={{
          textAlign: 'center',
          width: '100%',
          paddingLeft: 4,
          paddingRight: 4,
        }}
      >
        <Grid columns={2} gap={2}>
          <Button
            disabled={liveLoading || legacyLoading}
            variant="connectModal"
            onClick={() => connectLedger(LEDGER_LIVE_PATH)}
          >
            <Flex p={2} sx={{ justifyContent: 'center', alignItems: 'center' }}>
              <Grid gap={1}>
                <Text variant="paragraph2" sx={{ textAlign: 'center' }}>
                  {t('ledger-live')}
                </Text>
                <Text variant="paragraph3" sx={{ textAlign: 'center', color: 'lavender' }}>
                  {LEDGER_LIVE_PATH}
                </Text>
                {liveLoading && <AppSpinner size={18} />}
              </Grid>
            </Flex>
          </Button>
          <Button
            disabled={liveLoading || legacyLoading}
            variant="connectModal"
            onClick={() => connectLedger(LEDGER_LEGACY_PATH)}
          >
            <Flex p={2} sx={{ justifyContent: 'center', alignItems: 'center' }}>
              <Grid gap={1}>
                <Text variant="paragraph2" sx={{ textAlign: 'center' }}>
                  {t('ledger-legacy')}
                </Text>
                <Text variant="paragraph3" sx={{ textAlign: 'center', color: 'lavender' }}>
                  {LEDGER_LEGACY_PATH}
                </Text>
              </Grid>
              {legacyLoading && <AppSpinner size={18} />}
            </Flex>
          </Button>
        </Grid>
      </Grid>
      <Box sx={{ mt: '20px', borderTop: 'solid #EAEAEA 1px', textAlign: 'left' }}>
        <Text
          onClick={cancel}
          variant="links.inText"
          sx={{ fontSize: '14px', mt: '32px', mb: '32px', ml: '34px', cursor: 'pointer' }}
        >
          &lt;- {t('ledger-cancel')}
        </Text>
      </Box>
    </Box>
  )
}
