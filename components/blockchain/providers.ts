import { SvgImage } from 'helpers/icons/utils'

import coinbaseSvg from '../icons/providers/coinbase.svg'
import imTokenSvg from '../icons/providers/im-token.svg'
import ledgerSvg from '../icons/providers/ledger.svg'
import metamaskBlackSvg from '../icons/providers/metamask-black.svg'
import metamaskSvg from '../icons/providers/metamask.svg'
import parityBlackSvg from '../icons/providers/parity-black.svg'
import paritySvg from '../icons/providers/parity.svg'
import statusBlackSvg from '../icons/providers/status-black.svg'
import statusSvg from '../icons/providers/status.svg'
import trezorSvg from '../icons/providers/trezor.svg'
import trustBlackSvg from '../icons/providers/trust-black.svg'
import trustSvg from '../icons/providers/trust.svg'
import walletConnectSvg from '../icons/providers/wallet-connect.svg'
import walletLinkSvg from '../icons/providers/wallet-link.svg'
import webWalletSvg from '../icons/providers/web-wallet.svg'

function SvgImageSimple(image: string) {
  return SvgImage({
    image,
    style: {
      width: '100%',
      height: '100%',
    },
  })
}

export interface Provider {
  id?: number
  icon: string | React.ReactNode
  iconWhite?: string | React.ReactNode
  name: string
  supported: boolean
  website?: string
}

export const WebWallet = {
  id: 1,
  icon: SvgImageSimple(webWalletSvg),
  alias: 'web',
  name: 'Web Wallet',
  supported: true,
}

export const Metamask = {
  id: 2,
  icon: SvgImageSimple(metamaskSvg),
  iconWhite: SvgImageSimple(metamaskBlackSvg),
  alias: 'metamask',
  name: 'MetaMask',
  supported: true,
  website: 'https://metamask.io/',
}

export const WalletConnect = {
  id: 2,
  icon: SvgImageSimple(walletConnectSvg),
  iconWhite: SvgImageSimple(metamaskBlackSvg),
  alias: 'walletConnect',
  name: 'WalletConnect',
  supported: true,
  website: 'https://metamask.io/',
}

export const WalletLink = {
  id: 2,
  icon: SvgImageSimple(walletLinkSvg),
  iconWhite: SvgImageSimple(walletLinkSvg),
  alias: 'walletLink',
  name: 'WalletLink',
  supported: true,
  website: 'https://metamask.io/',
}

export const Trust = {
  id: 3,
  alias: 'trust',
  name: 'Trust Wallet',
  icon: SvgImageSimple(trustSvg),
  iconWhite: SvgImageSimple(trustBlackSvg),
  supported: true,
  website: 'https://trustwallet.com/',
}

export const Status = {
  id: 4,
  alias: 'status',
  name: 'Status',
  icon: SvgImageSimple(statusSvg),
  iconWhite: SvgImageSimple(statusBlackSvg),
  supported: true,
  website: 'https://status.im/',
}

export const Coinbase = {
  id: 5,
  alias: 'coinbase',
  name: 'Coinbase Wallet',
  icon: SvgImageSimple(coinbaseSvg),
  supported: true,
}

export const Parity = {
  id: 6,
  alias: 'parity',
  name: 'Parity',
  icon: SvgImageSimple(paritySvg),
  iconWhite: SvgImageSimple(parityBlackSvg),
  supported: true,
  website: 'https://www.parity.io/',
}

export const ImToken = {
  id: 7,
  alias: 'imToken',
  name: 'imToken',
  icon: SvgImageSimple(imTokenSvg),
  supported: true,
}

export const Trezor = {
  id: 20,
  icon: SvgImageSimple(trezorSvg),
  alias: 'trezor',
  name: 'Trezor',
  supported: true,
}

export const Ledger = {
  id: 30,
  icon: SvgImageSimple(ledgerSvg),
  alias: 'ledger',
  name: 'Ledger',
  supported: false,
}

export function getCurrentProviderName(
  provider = (window as any).ethereum
    ? (window as any).ethereum
    : (window as any).web3
    ? (window as any).web3.currentProvider
    : null,
): Provider {
  if (!provider) {
    return WebWallet
  }

  if (provider.isMetaMask) {
    return Metamask
  }

  if (provider.isTrust) {
    return Trust
  }

  if (provider.isStatus) {
    return Status
  }

  if (typeof (window as any).SOFA !== 'undefined') {
    return Coinbase
  }

  if (provider.constructor && provider.constructor.name === 'Web3FrameProvider') {
    return Parity
  }

  if (provider.isImToken) {
    return ImToken
  }

  return WebWallet
}
