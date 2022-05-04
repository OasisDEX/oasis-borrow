import { SafeAppConnector } from '@gnosis.pm/safe-apps-web3-react'
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
import { AppSpinner } from 'helpers/AppSpinner'
import { useObservable } from 'helpers/observableHook'
import { WithChildren } from 'helpers/types'
import { useRedirect } from 'helpers/useRedirect'
import { mapValues } from 'lodash'
import { useTranslation } from 'next-i18next'
import React, { useEffect, useState } from 'react'
import { identity, Observable } from 'rxjs'
import { first, tap } from 'rxjs/operators'
import { Alert, Box, Button, Flex, Grid, Heading, Link, Text } from 'theme-ui'
import { UserWalletIconName } from 'theme/icons'
import { assert } from 'ts-essentials'

import { ModalProps, useModal, WithClose } from '../../helpers/modalHook'
import { SwitchNetworkModal, SwitchNetworkModalType } from '../SwitchNetworkModal'
import { Modal, ModalCloseIcon } from '../Modal'
import { ChevronDown } from 'react-feather'
import { Widget } from '@typeform/embed-react'

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
  options: Record<string, any> = {},
) {
  assert(rpcUrls[network], 'Unsupported chainId!')

  if (
    connectorKind !== 'injected' &&
    connectorKind !== 'network' &&
    network !== 1 &&
    connectorKind !== 'gnosisSafe' // only for debugging purposes since gnosis wallet on mainnet cost a lot
  ) {
    options.switchNetworkModal('appNetwork')
    throw new Error(
      `Your wallet only supports Mainnet and current application network is ${network}. Please switch.`,
    )
  }

  switch (connectorKind) {
    case 'injected': {
      const connector = new InjectedConnector({
        supportedChainIds: Object.values(networksById).map(({ id }) => Number.parseInt(id)),
      })
      const connectorChainId = Number.parseInt((await connector.getChainId()) as string)
      if (network !== connectorChainId) {
        options.switchNetworkModal(connectorKind)
        throw new Error('Browser ethereum provider and URL network param do not match!')
      }
      return connector
    }
    case 'walletLink': {
      return new WalletLinkConnector({
        url: rpcUrls[network],
        appName: dappName,
        supportedChainIds: [1],
      })
    }
    case 'walletConnect':
      return new WalletConnectConnector({
        rpc: { [network]: rpcUrls[network] },
        bridge: 'https://bridge.walletconnect.org',
        qrcode: true,
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
    case 'gnosisSafe':
      return new SafeAppConnector()
    case 'magicLink':
      throw new Error('Magic Link not allowed')
  }
}

const SUPPORTED_WALLETS: ConnectionKind[] = [
  'injected',
  'walletConnect',
  'ledger',
  'trezor',
  'walletLink',
  'myetherwallet',
  'portis',
  'gnosisSafe',
]

function ConnectWalletButtonWrapper({
  children,
  missingInjectedWallet,
}: {
  missingInjectedWallet?: boolean
} & WithChildren) {
  return missingInjectedWallet ? (
    <AppLink href="https://metamask.io/">{children}</AppLink>
  ) : (
    <>{children}</>
  )
}

type ConnectWalletButtonProps = {
  web3Context: Web3Context
  connectionKind: ConnectionKind
  setConnectingLedger: () => void
  switchNetworkModal: (type: SwitchNetworkModalType) => void
}

function ConnectWalletButton({
  web3Context,
  connectionKind,
  setConnectingLedger,
  switchNetworkModal,
}: ConnectWalletButtonProps) {
  const { t } = useTranslation()
  const isConnecting =
    (web3Context.status === 'connecting' || web3Context.status === 'connected') &&
    web3Context.connectionKind === connectionKind
  const walletKind = getWalletKind(connectionKind)
  const { friendlyName, connectIcon } = getConnectionDetails(walletKind)
  const descriptionTranslation = isConnecting ? 'connect-confirm' : 'connect-with'
  const missingInjectedWallet = walletKind === 'nonexistent'
  const description = missingInjectedWallet
    ? t('connect-install-metamask')
    : t(descriptionTranslation, {
        connectionKind: friendlyName,
      })

  const networkId = getNetworkId()

  const connectClick =
    web3Context.status === 'connecting'
      ? undefined
      : connectionKind === 'ledger'
      ? networkId !== 1
        ? () => switchNetworkModal('appNetwork')
        : () => setConnectingLedger()
      : connect(web3Context, connectionKind, networkId, {
          switchNetworkModal,
        })

  return (
    <ConnectWalletButtonWrapper {...{ missingInjectedWallet }}>
      <Button
        variant="square"
        sx={{
          cursor: 'pointer',
          textAlign: 'center',
          width: '100%',
          '&:hover': {
            boxShadow: 'cardLanding',
            opacity: '1',
          },
          border: 'solid 1px #EAEAEA',
          padding: 3,
        }}
        onClick={connectClick}
      >
        {isConnecting ? (
          <AppSpinner size={42} />
        ) : (
          <Icon name={connectIcon || 'metamask_color'} size={42} />
        )}
        <Box>{description}</Box>
      </Button>
    </ConnectWalletButtonWrapper>
  )
}

function connect(
  web3Context: Web3Context | undefined,
  connectorKind: ConnectionKind,
  chainId: number,
  options: Record<string, unknown> = {},
) {
  return async () => {
    if (
      web3Context?.status === 'error' ||
      web3Context?.status === 'notConnected' ||
      web3Context?.status === 'connectedReadonly'
    ) {
      try {
        const connector = await getConnector(connectorKind, chainId, options)
        web3Context.connect(connector, connectorKind)
      } catch (e) {
        console.log(e)
      }
    }
  }
}
type InjectedWalletKind =
  | 'metamask'
  | 'imtoken'
  | 'alphawallet'
  | 'trust'
  | 'coinbase'
  | 'mist'
  | 'parity'
  | 'infura'
  | 'localhost'
  | 'unknowninjected'
  | 'nonexistent'

export function getInjectedWalletKind(): InjectedWalletKind {
  const w = window as any

  if (w.imToken) return 'imtoken'

  if (w.ethereum?.isMetaMask) return 'metamask'

  if (!w.web3 || typeof w.web3.currentProvider === 'undefined') return 'nonexistent'

  if (w.web3.currentProvider.isAlphaWallet) return 'alphawallet'

  if (w.web3.currentProvider.isTrust) return 'trust'

  if (typeof w.SOFA !== 'undefined') return 'coinbase'

  if (typeof w.__CIPHER__ !== 'undefined') return 'coinbase'

  if (w.web3.currentProvider.constructor.name === 'EthereumProvider') return 'mist'

  if (w.web3.currentProvider.constructor.name === 'Web3FrameProvider') return 'parity'

  if (w.web3.currentProvider.host && w.web3.currentProvider.host.indexOf('infura') !== -1)
    return 'infura'

  if (w.web3.currentProvider.host && w.web3.currentProvider.host.indexOf('localhost') !== -1)
    return 'localhost'

  return 'unknowninjected'
}

type WalletKind = Exclude<ConnectionKind, 'injected'> | InjectedWalletKind
interface ConnectionDetail {
  friendlyName: string
  connectIcon?: string
  userIcon?: UserWalletIconName
}

const connectionDetails: Record<WalletKind, ConnectionDetail> = {
  walletConnect: {
    friendlyName: 'WalletConnect',
    connectIcon: 'walletConnect_connect_icon',
    userIcon: 'walletConnect_user',
  },
  walletLink: {
    friendlyName: 'Coinbase wallet',
    connectIcon: 'coinbase_connect_icon',
    userIcon: 'walletLink_user',
  },
  portis: {
    friendlyName: 'Portis wallet',
    connectIcon: 'portis_connect_icon',
    userIcon: 'portis_user',
  },
  myetherwallet: {
    friendlyName: 'My Ether Wallet',
    connectIcon: 'myetherwallet_connect_icon',
    userIcon: 'myetherwallet_user',
  },
  trezor: {
    friendlyName: 'Trezor',
    connectIcon: 'trezor_connect_icon',
    userIcon: 'trezor_user',
  },
  ledger: {
    friendlyName: 'Ledger',
    connectIcon: 'ledger_connect_icon',
    userIcon: 'ledger_user',
  },
  network: {
    friendlyName: 'Network',
  },
  gnosisSafe: {
    friendlyName: 'Gnosis Safe',
    connectIcon: 'gnosis_safe_connect_icon',
    userIcon: 'gnosisSafe_user',
  },
  magicLink: {
    friendlyName: 'MagicLink',
  },
  imtoken: {
    friendlyName: 'IMToken',
  },
  metamask: {
    friendlyName: 'MetaMask',
    connectIcon: 'metamask_connect_icon',
    userIcon: 'metamask_user',
  },
  alphawallet: {
    friendlyName: 'Alpha Wallet',
  },
  trust: {
    friendlyName: 'Trust',
  },
  coinbase: {
    friendlyName: 'Coinbase',
  },
  mist: {
    friendlyName: 'Mist',
  },
  parity: {
    friendlyName: 'Parity',
  },
  infura: {
    friendlyName: 'Infura',
  },
  localhost: {
    friendlyName: 'Localhost',
  },
  unknowninjected: {
    friendlyName: 'Injected provider',
  },
  nonexistent: {
    friendlyName: '',
  },
}

export function getConnectionDetails(walletKind: WalletKind): ConnectionDetail {
  // Set default wallet icon
  return { ...{ userIcon: 'someWallet_user' }, ...connectionDetails[walletKind] }
}

export function getWalletKind(connectionKind: ConnectionKind): WalletKind {
  return connectionKind === 'injected' ? getInjectedWalletKind() : connectionKind
}

export function ConnectWalletModal({ close }: ModalProps<void>) {
  return (
    <Modal
      close={close}
      sx={{
        maxWidth: '756px',
        margin: '0 auto',
        height: 'auto',
        mt: '174px',
      }}
    >
      <ModalCloseIcon {...{ close }} />
      <Grid
        sx={{
          mt: 4,
        }}
      >
        <ConnectWallet close={close} />
      </Grid>
    </Modal>
  )
}

function WalletRecommendationModal({ close }: ModalProps<void>) {
  return (
    <Modal
      close={close}
      sx={{
        maxWidth: '756px',
        margin: '0 auto',
        height: 'auto',
        mt: '174px',
      }}
    >
      <ModalCloseIcon {...{ close }} />
      <Box sx={{ padding: '5px' }}>
        <Widget
          id="X2EGx7W4"
          style={{ height: '650px' }}
          opacity={0}
          hideFooter={true}
          hideHeaders={true}
        />
      </Box>
    </Modal>
  )
}

export function ConnectWallet(props: WithClose) {
  const closeModal = props.close
  const { web3Context$, redirectState$ } = useAppContext()
  const [web3Context] = useObservable(web3Context$)
  const { t } = useTranslation()
  const { replace } = useRedirect()
  const [connectingLedger, setConnectingLedger] = useState(false)
  const openModal = useModal()
  const switchNetworkModal = (type: SwitchNetworkModalType) =>
    openModal(SwitchNetworkModal, {
      type,
      promptForReconnection: () => openModal(WalletRecommendationModal),
    })

  const [showMoreWallets, setShowMoreWallets] = useState(false)

  useEffect(() => {
    const subscription = web3Context$.subscribe((web3Context) => {
      if (web3Context.status === 'connected') {
        closeModal()
      }
    })
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (web3Context?.status === 'error') {
      if (
        web3Context.error instanceof UnsupportedChainIdError ||
        web3Context.error.name === 'TransportStatusError' // error when application is not selected on the ledger
      ) {
        switchNetworkModal('userNetwork')
      }
    }
  }, [web3Context?.status])

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
        {t('connect-wallet')}
      </Heading>
      {web3Context.status === 'error' && (
        <Alert variant="error" sx={{ fontWeight: 'normal', borderRadius: 'large' }}>
          <Text sx={{ my: 1, ml: 2, fontSize: 3, lineHeight: 'body' }}>{t('connect-error')}</Text>
        </Alert>
      )}
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
        <Grid columns={4} gap={2}>
          {SUPPORTED_WALLETS.slice(0, 4).map((connectionKind) => {
            return (
              <ConnectWalletButton
                key={connectionKind}
                web3Context={web3Context}
                setConnectingLedger={() => setConnectingLedger(true)}
                switchNetworkModal={switchNetworkModal}
                connectionKind={connectionKind}
              />
            )
          })}
          {showMoreWallets &&
            SUPPORTED_WALLETS.slice(4, SUPPORTED_WALLETS.length).map((connectionKind) => {
              return (
                <ConnectWalletButton
                  key={connectionKind}
                  web3Context={web3Context}
                  setConnectingLedger={() => setConnectingLedger(true)}
                  switchNetworkModal={switchNetworkModal}
                  connectionKind={connectionKind}
                />
              )
            })}
        </Grid>

        {!showMoreWallets && (
          <Text
            variant="paragraph3"
            sx={{
              fontWeight: 'semiBold',
              color: '#787A9B',
              '&:hover': {
                color: 'primary',
              },
              cursor: 'pointer',
            }}
            onClick={() => setShowMoreWallets(true)}
          >
            More wallets
            <Icon
              name="chevron_down"
              sx={{
                position: 'relative',
                top: '4px',
                left: '9px',
              }}
            />
          </Text>
        )}

        {showMoreWallets && (
          <Text variant="paragraph3" sx={{ color: '#787A9B' }}>
            Not found the wallet you use?{' '}
            <Link
              variant="links.inText"
              sx={{ color: '#575CFE', cursor: 'pointer' }}
              onClick={() => {
                openModal(WalletRecommendationModal)
              }}
            >
              Let us know -&gt;
            </Link>
          </Text>
        )}
      </Grid>
      <Box sx={{ mt: '20px', pt: '24px', pb: '24px', borderTop: 'solid #EAEAEA 1px' }}>
        <Text sx={{ mb: 2 }} variant="paragraph3">
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
          <Text variant="paragraph3" sx={{ color: 'inherit' }}>
            {t('learn-about-wallets')}
          </Text>
          <Icon sx={{ ml: 1 }} name="open_in_new_tab" />
        </AppLink>
      </Box>
    </Box>
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

export function disconnect(web3Context: Web3Context | undefined) {
  if (web3Context?.status === 'connected') {
    web3Context.deactivate()

    // WalletConnect places this in LS and tries to reconnect without asking for QR
    if (web3Context.connectionKind === 'walletConnect') {
      localStorage.removeItem('walletconnect')
    }
  }
}

async function connectReadonly(web3Context: Web3ContextNotConnected) {
  web3Context.connect(await getConnector('network', getNetworkId()), 'network')
}

/**
 * Ensures a connection.
 *
 * If connection state error or unsupported chain ID, push current location to stack and redirect
 * to connect page.
 *
 * If connection is readonly, push current current locaation on to redirect state
 *
 * Triggers reconnection from localstorage.
 *
 * @param children
 * @constructor
 */
export function WithConnection({ children }: WithChildren) {
  const { web3Context$ } = useAppContext()
  const [web3Context] = useObservable(web3Context$)
  const openModal = useModal()

  useEffect(() => {
    if (web3Context?.status === 'error' && web3Context.error instanceof UnsupportedChainIdError) {
      disconnect(web3Context)
      openModal(ConnectWalletModal)
    }

    if (web3Context && web3Context.status === 'connectedReadonly') {
      redirectState$.next(window.location.pathname)
    }
  }, [web3Context?.status])

  useEffect(() => autoConnect(web3Context$, getNetworkId(), connectReadonly), [])

  return children
}

/**
 * Ensures a different type of connection?
 * @param children
 * @constructor
 */
export function WithWalletConnection({ children }: WithChildren) {
  const { web3Context$ } = useAppContext()
  const [web3Context] = useObservable(web3Context$)
  const openModal = useModal()

  useEffect(() => {
    if (web3Context?.status === 'error' && web3Context.error instanceof UnsupportedChainIdError) {
      disconnect(web3Context)
      openModal(ConnectWalletModal)
    }

    if (web3Context?.status === 'connectedReadonly') {
      openModal(ConnectWalletModal)
    }

    if (web3Context?.status === 'notConnected') {
      redirectState$.next(window.location.pathname)
      autoConnect(web3Context$, getNetworkId(), () => openModal(ConnectWalletModal))
    }
  }, [web3Context?.status])

  return children
}
