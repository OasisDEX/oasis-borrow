import { SafeAppConnector } from '@gnosis.pm/safe-apps-web3-react'
import { MewConnectConnector } from '@myetherwallet/mewconnect-connector'
import { LedgerConnector, TrezorConnector } from '@oasisdex/connectors'
import {
  ConnectionKind,
  getNetworkId,
  Web3Context,
  Web3ContextNotConnected,
} from '@oasisdex/web3-context'
import { useConnectModal } from '@rainbow-me/rainbowkit'
import { UnsupportedChainIdError } from '@web3-react/core'
import { InjectedConnector } from '@web3-react/injected-connector'
import { NetworkConnector } from '@web3-react/network-connector'
import { PortisConnector } from '@web3-react/portis-connector'
import { WalletConnectConnector } from '@web3-react/walletconnect-connector'
import { WalletLinkConnector } from '@web3-react/walletlink-connector'
import { dappName, networksById, pollingInterval } from 'blockchain/config'
import browserDetect from 'browser-detect'
import { useAppContext } from 'components/AppContextProvider'
import { redirectState$ } from 'features/router/redirectState'
import { getCustomNetworkParameter } from 'helpers/getCustomNetworkParameter'
import { useObservable } from 'helpers/observableHook'
import { WithChildren } from 'helpers/types'
import { useRedirect } from 'helpers/useRedirect'
import { mapValues } from 'lodash'
import { useEffect } from 'react'
import { Observable } from 'rxjs'
import { UserWalletIconName } from 'theme/icons'
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
  'walletLink',
  'portis',
  'myetherwallet',
  'trezor',
  'gnosisSafe',
]

const isFirefox = browserDetect().name === 'firefox'
if (!isFirefox) {
  SUPPORTED_WALLETS.push('ledger')
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
    connectIcon: 'wallet_connect_color',
    userIcon: 'walletConnect_user',
  },
  walletLink: {
    friendlyName: 'Coinbase Wallet',
    connectIcon: 'coinbase_color',
    userIcon: 'walletLink_user',
  },
  portis: {
    friendlyName: 'Portis wallet',
    connectIcon: 'portis',
    userIcon: 'portis_user',
  },
  myetherwallet: {
    friendlyName: 'My Ether Wallet',
    connectIcon: 'myetherwallet',
    userIcon: 'myetherwallet_user',
  },
  trezor: {
    friendlyName: 'Trezor',
    connectIcon: 'trezor',
    userIcon: 'trezor_user',
  },
  ledger: {
    friendlyName: 'Ledger',
    connectIcon: 'ledger',
    userIcon: 'ledger_user',
  },
  network: {
    friendlyName: 'Network',
  },
  gnosisSafe: {
    friendlyName: 'Gnosis Safe',
    connectIcon: 'gnosis_safe',
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
    connectIcon: 'metamask_color',
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

export function WithConnection({ children }: WithChildren) {
  const { replace } = useRedirect()
  const { web3Context$ } = useAppContext()
  const [web3Context] = useObservable(web3Context$)

  useEffect(() => {
    if (web3Context?.status === 'error' && web3Context.error instanceof UnsupportedChainIdError) {
      disconnect(web3Context)
      redirectState$.next(window.location.pathname)
      replace(`/connect`, getCustomNetworkParameter())
    }

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
  const [web3Context] = useObservable(web3Context$)
  const { openConnectModal } = useConnectModal()

  useEffect(() => {
    if (web3Context?.status === 'error' && web3Context.error instanceof UnsupportedChainIdError) {
      disconnect(web3Context)
      redirectState$.next(window.location.pathname)
      replace(`/connect`, getCustomNetworkParameter())
    }

    if (web3Context?.status === 'connectedReadonly') {
      openConnectModal && void openConnectModal()
      // redirectState$.next(window.location.pathname)
      // replace(`/connect`, getCustomNetworkParameter())
    }

    if (web3Context?.status === 'notConnected') {
      openConnectModal && void openConnectModal()
      // redirectState$.next(window.location.pathname)
      // autoConnect(web3Context$, getNetworkId(), () =>
      //   replace(`/connect`, getCustomNetworkParameter()),
      // )
    }
  }, [web3Context?.status])

  return children
}
