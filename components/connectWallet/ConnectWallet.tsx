// @ts-ignore
import { Icon } from '@makerdao/dai-ui-icons'
import { MewConnectConnector } from '@myetherwallet/mewconnect-connector'
import { LedgerConnector, TrezorConnector } from '@oasisdex/connectors'
import {
  ConnectionKind,
  getNetworkId,
  Web3Context,
  Web3ContextNotConnected,
} from '@oasisdex/web3-context'
import { UnsupportedChainIdError } from '@web3-react/core'
import { InjectedConnector } from '@web3-react/injected-connector'
import { NetworkConnector } from '@web3-react/network-connector'
import { PortisConnector } from '@web3-react/portis-connector'
import { WalletConnectConnector } from '@web3-react/walletconnect-connector'
import { WalletLinkConnector } from '@web3-react/walletlink-connector'
import { dappName, networksById, pollingInterval } from 'blockchain/config'
import browserDetect from 'browser-detect'
import { useAppContext } from 'components/AppContextProvider'
import { LedgerAccountSelection } from 'components/connectWallet/LedgerAccountSelection'
import { TrezorAccountSelection } from 'components/connectWallet/TrezorAccountSelection'
import { AppLink } from 'components/Links'
import { redirectState$ } from 'features/router/redirectState'
import { AppSpinner } from 'helpers/loadingIndicator/LoadingIndicator'
import { useObservable } from 'helpers/observableHook'
import { WithChildren } from 'helpers/types'
import { useRedirect } from 'helpers/useRedirect'
import { mapValues } from 'lodash'
import { useTranslation } from 'next-i18next'
import React, { useEffect } from 'react'
import { identity, Observable } from 'rxjs'
import { first, tap } from 'rxjs/operators'
import { Alert, Box, Button, Flex, Grid, Heading, Text } from 'theme-ui'
import { assert } from 'ts-essentials'

export const AUTO_CONNECT = 'autoConnect'

interface AutoConnectLocalStorage {
  connectionKind: ConnectionKind
  magicLinkEmail?: string
}

const rpcUrls: { [chainId: number]: string } = mapValues(
  networksById,
  (network) => network.infuraUrl,
)

export async function getConnector(
  connectorKind: ConnectionKind,
  network: number,
  options: any = {},
) {
  assert(rpcUrls[network], 'Unsupported chainId!')
  switch (connectorKind) {
    case 'injected':
      const connector = new InjectedConnector({
        supportedChainIds: Object.values(networksById).map(({ id }) => Number.parseInt(id)),
      })
      const connectorChainId = Number.parseInt((await connector.getChainId()) as string)
      if (network !== connectorChainId) {
        alert('Browser ethereum provider and URL network param do not match!')
        throw new Error('Browser ethereum provider and URL network param do not match!')
      }
      return connector
    case 'walletLink':
      return new WalletLinkConnector({
        url: rpcUrls[network],
        appName: dappName,
      })
    case 'walletConnect':
      return new WalletConnectConnector({
        rpc: { [network]: rpcUrls[network] },
        bridge: 'https://bridge.walletconnect.org',
        qrcode: true,
        pollingInterval,
      })
    case 'trezor':
      return new TrezorConnector({
        chainId: network,
        url: rpcUrls[network],
        pollingInterval: pollingInterval,
        manifestEmail: 'dummy@abc.xyz',
        manifestAppUrl: 'http://localhost:1234',
        config: { networkId: network },
      })
    case 'ledger':
      return new LedgerConnector({
        ...options,
        chainId: network,
        url: rpcUrls[network],
        pollingInterval: pollingInterval,
      })
    case 'network':
      return new NetworkConnector({
        urls: { [network]: networksById[network].infuraUrl },
        defaultChainId: network,
      })
    case 'portis':
      return new PortisConnector({
        networks: [network],
        dAppId: 'e0ac7d6b-a19b-4f61-928d-fb97b15c424a',
      })
    case 'myetherwallet':
      return new MewConnectConnector({
        url: rpcUrls[network],
      })
    case 'magicLink':
      throw new Error('Magic Link not allowed')
  }
}

interface SupportedWallet {
  iconName: string
  connectionKind: ConnectionKind
}

const SUPPORTED_WALLETS: SupportedWallet[] = [
  { iconName: 'metamask_color', connectionKind: 'injected' },
  { iconName: 'wallet_connect_color', connectionKind: 'walletConnect' },
  { iconName: 'coinbase_color', connectionKind: 'walletLink' },
  { iconName: 'portis', connectionKind: 'portis' },
  { iconName: 'myetherwallet', connectionKind: 'myetherwallet' },
  { iconName: 'trezor', connectionKind: 'trezor' },
]

const isFirefox = browserDetect().name === 'firefox'
if (!isFirefox) {
  SUPPORTED_WALLETS.push({ iconName: 'ledger', connectionKind: 'ledger' })
}

function ConnectWalletButton({
  isConnecting,
  iconName,
  connect,
  description,
}: {
  isConnecting: boolean
  iconName: string
  description: string
  connect?: () => void
}) {
  return (
    <Button
      variant="square"
      sx={{
        cursor: 'pointer',
        textAlign: 'center',
        '&:hover .connect-wallet-arrow': {
          transform: 'translateX(5px)',
          opacity: '1',
        },
      }}
      onClick={connect}
    >
      <Flex sx={{ alignItems: 'center' }}>
        <Flex sx={{ ml: 1, mr: 3, alignItems: 'center' }}>
          {isConnecting ? <AppSpinner size={22} /> : <Icon name={iconName} size={22} />}
        </Flex>
        <Flex sx={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Box>{description}</Box>
          <Box
            className="connect-wallet-arrow"
            sx={{
              ml: 1,
              opacity: '0',
              transform: 'translateX(0px)',
              transition: 'opacity ease-in 0.2s, transform ease-in 0.3s',
            }}
          >
            <Icon sx={{ position: 'relative', top: '3px' }} name="arrow_right" />
          </Box>
        </Flex>
      </Flex>
    </Button>
  )
}

function connect(
  web3Context: Web3Context | undefined,
  connectorKind: ConnectionKind,
  chainId: number,
  options: any = {},
) {
  return async () => {
    if (
      web3Context?.status === 'error' ||
      web3Context?.status === 'notConnected' ||
      web3Context?.status === 'connectedReadonly'
    ) {
      try {
        web3Context.connect(await getConnector(connectorKind, chainId, options), connectorKind)
      } catch (e) {
        console.log(e)
      }
    }
  }
}

export function getInjectedWalletKind() {
  const w = window as any

  if (w.imToken) return 'IMToken'

  if (w.ethereum?.isMetaMask) return 'MetaMask'

  if (!w.web3 || typeof w.web3.currentProvider === 'undefined') return undefined

  if (w.web3.currentProvider.isAlphaWallet) return 'Alpha Wallet'

  if (w.web3.currentProvider.isTrust) return 'Trust'

  if (typeof w.SOFA !== 'undefined') return 'Coinbase'

  if (typeof w.__CIPHER__ !== 'undefined') return 'Coinbase'

  if (w.web3.currentProvider.constructor.name === 'EthereumProvider') return 'Mist'

  if (w.web3.currentProvider.constructor.name === 'Web3FrameProvider') return 'Parity'

  if (w.web3.currentProvider.host && w.web3.currentProvider.host.indexOf('infura') !== -1)
    return 'Infura'

  if (w.web3.currentProvider.host && w.web3.currentProvider.host.indexOf('localhost') !== -1)
    return 'Localhost'

  return 'Injected provider'
}

export function getConnectionKindMessage(connectionKind: ConnectionKind) {
  switch (connectionKind) {
    case 'injected':
      return getInjectedWalletKind()
    case 'walletConnect':
      return 'WalletConnect'
    case 'walletLink':
      return 'Coinbase wallet'
    case 'portis':
      return 'Portis wallet'
    case 'myetherwallet':
      return 'My Ether Wallet'
    case 'trezor':
      return 'Trezor'
    case 'ledger':
      return 'Ledger'
    case 'network':
      return 'Network'
    case 'magicLink':
      return 'MagicLink'
  }
}

export function ConnectWallet() {
  const { web3Context$, redirectState$ } = useAppContext()
  const web3Context = useObservable(web3Context$)
  const { t } = useTranslation('common')
  const { replace } = useRedirect()
  const [connectingLedger, setConnectingLedger] = React.useState(false)

  useEffect(() => {
    const subscription = web3Context$.subscribe((web3Context) => {
      if (web3Context.status === 'connected') {
        const url = redirectState$.value
        if (url !== undefined) {
          replace(url)
          redirectState$.next(undefined)
        } else {
          replace(`/owner/${web3Context.account}`)
        }
      }
    })
    return () => subscription.unsubscribe()
  }, [])

  if (!web3Context) {
    return null
  }

  if (connectingLedger) {
    return (
      <LedgerAccountSelection
        cancel={() => {
          setConnectingLedger(false)
          web3Context$
            .pipe(
              first(),
              tap((web3Context) => {
                if (
                  web3Context.status === 'connectingHWSelectAccount' ||
                  web3Context.status === 'error'
                ) {
                  web3Context.deactivate()
                }
              }),
            )
            .subscribe(identity)
        }}
        chainId={getNetworkId()}
        web3Context={web3Context}
      />
    )
  }

  if (
    (web3Context.status === 'connecting' || web3Context.status === 'connectingHWSelectAccount') &&
    web3Context.connectionKind === 'trezor'
  ) {
    return (
      <TrezorAccountSelection
        cancel={() => {
          web3Context$
            .pipe(
              first(),
              tap((web3Context) => {
                if (web3Context.status === 'connectingHWSelectAccount') {
                  web3Context.deactivate()
                }
              }),
            )
            .subscribe(identity)
        }}
        web3Context={web3Context}
      />
    )
  }

  if (web3Context.status === 'connecting' && web3Context.connectionKind === 'network') {
    return <Box>{t('readonly-user-connecting')}</Box>
  }

  return (
    <Grid
      gap={4}
      columns="1fr"
      sx={{
        textAlign: 'center',
        width: '100%',
      }}
    >
      <Heading as="h1">{t('connect-wallet')}</Heading>
      {web3Context.status === 'error' &&
        ((web3Context.error instanceof UnsupportedChainIdError && (
          <Alert variant="error" sx={{ fontWeight: 'normal', borderRadius: 'large' }}>
            <Text sx={{ my: 1, ml: 2, fontSize: 3, lineHeight: 'body' }}>
              {t('metamask-unsupported-network')}
            </Text>
          </Alert>
        )) || (
          <Alert variant="error" sx={{ fontWeight: 'normal', borderRadius: 'large' }}>
            <Text sx={{ my: 1, ml: 2, fontSize: 3, lineHeight: 'body' }}>{t('connect-error')}</Text>
          </Alert>
        ))}
      <Grid columns={1} sx={{ maxWidth: '280px', width: '100%', mx: 'auto' }}>
        {SUPPORTED_WALLETS.map(({ iconName, connectionKind }) => {
          const isConnecting =
            (web3Context.status === 'connecting' || web3Context.status === 'connected') &&
            web3Context.connectionKind === connectionKind
          const connectionKindMsg = getConnectionKindMessage(connectionKind)
          const descriptionTranslation = isConnecting ? 'connect-confirm' : 'connect-with'

          return (
            <ConnectWalletButton
              {...{
                key: connectionKind,
                isConnecting,
                iconName,
                description: t(descriptionTranslation, {
                  connectionKind: connectionKindMsg,
                }),
                connect:
                  web3Context.status === 'connecting'
                    ? undefined
                    : connectionKind === 'ledger'
                    ? () => setConnectingLedger(true)
                    : connect(web3Context, connectionKind, getNetworkId()),
              }}
            />
          )
        })}
        <Box sx={{ mt: 4 }}>
          <Text sx={{ fontWeight: 'semiBold', mb: 2 }} variant="paragraph2">
            {t('new-to-ethereum')}
          </Text>
          <AppLink
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              transition: 'opacity ease-in 0.2s',
              '&:hover': {
                opacity: 0.7,
              },
            }}
            href={t('learn-more-link')}
          >
            <Text variant="paragraph2" sx={{ color: 'inherit', fontWeight: 'semiBold' }}>
              {t('learn-about-wallets')}
            </Text>
            <Icon sx={{ ml: 1 }} name="open_in_new_tab" />
          </AppLink>
        </Box>
      </Grid>
    </Grid>
  )
}

function autoConnect(
  web3Context$: Observable<Web3Context>,
  defaultChainId: number,
  fallback: (web3Context: Web3ContextNotConnected) => void,
) {
  let firstTime = true

  const subscription = web3Context$.subscribe(async (web3Context) => {
    try {
      const serialized = localStorage.getItem(AUTO_CONNECT)
      if (firstTime && web3Context.status === 'notConnected' && serialized) {
        const { connectionKind, magicLinkEmail } = JSON.parse(serialized) as AutoConnectLocalStorage
        if (connectionKind !== 'ledger' && connectionKind !== 'trezor') {
          console.log('autoConnecting from localStorage', connectionKind, defaultChainId)
          const connector = await getConnector(connectionKind, defaultChainId, {
            email: magicLinkEmail,
          })
          web3Context.connect(connector, connectionKind)
        }
      } else if (web3Context.status === 'notConnected') {
        fallback(web3Context)
      }
      if (web3Context.status === 'connected') {
        localStorage.setItem(
          AUTO_CONNECT,
          JSON.stringify({
            connectionKind: web3Context.connectionKind,
            ...(web3Context.connectionKind === 'magicLink' && {
              magicLinkEmail: web3Context.magicLinkEmail,
            }),
          }),
        )
      } else {
        localStorage.removeItem(AUTO_CONNECT)
      }
    } catch (e) {
      if (web3Context.status === 'notConnected') {
        fallback(web3Context)
      }
    } finally {
      firstTime = false
    }
  })
  return () => {
    subscription.unsubscribe()
  }
}

async function connectReadonly(web3Context: Web3ContextNotConnected) {
  web3Context.connect(await getConnector('network', getNetworkId()), 'network')
}

export function WithConnection({ children }: WithChildren) {
  const { web3Context$ } = useAppContext()
  const web3Context = useObservable(web3Context$)

  useEffect(() => {
    if (web3Context && web3Context.status === 'connectedReadonly') {
      redirectState$.next(window.location.pathname)
    }
  }, [web3Context?.status])

  useEffect(() => autoConnect(web3Context$, getNetworkId(), connectReadonly), [])

  return children
}

export function WithWalletConnection({ children }: WithChildren) {
  const { replace } = useRedirect()
  const { web3Context$ } = useAppContext()
  const web3Context = useObservable(web3Context$)
  useEffect(() => {
    if (web3Context?.status === 'connectedReadonly') {
      redirectState$.next(window.location.pathname)
      replace(`/connect`)
    }
    if (web3Context?.status === 'notConnected') {
      redirectState$.next(window.location.pathname)
      autoConnect(web3Context$, getNetworkId(), () => replace(`/connect`))
    }
  }, [web3Context?.status])

  return children
}
