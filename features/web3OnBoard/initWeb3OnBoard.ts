import coinbaseModule from '@web3-onboard/coinbase'
import gnosisModule from '@web3-onboard/gnosis'
import injectedModule from '@web3-onboard/injected-wallets'
import ledgerModule from '@web3-onboard/ledger'
import { init } from '@web3-onboard/react'
import trezorModule from '@web3-onboard/trezor'
import walletConnectModule from '@web3-onboard/walletconnect'
import { networks } from 'blockchain/networksConfig'

const injected = injectedModule({
  custom: [],
  filter: {},
})

const walletLink = coinbaseModule()

const walletConnect = walletConnectModule()

const ledger = ledgerModule()
const gnosis = gnosisModule()

const trezorOptions = {
  email: 'support@oasis.app',
  appUrl: 'https://oasis.app',
}
const trezor = trezorModule(trezorOptions)

export const initWeb3OnBoard = init({
  wallets: [injected, walletConnect, walletLink, gnosis, ledger, trezor],
  chains: [
    ...networks.map((network) => ({
      id: network.hexId,
      label: network.label,
      rpcUrl: network.rpcCallsEndpoint,
      token: network.token,
      color: network.color,
    })),
  ],
  appMetadata: {
    name: 'Oasis.app',
    icon:
      '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" fill="none" viewBox="0 0 200 200">\n' +
      '  <path fill="url(#a)" fill-rule="evenodd" d="M45 87.8C50.5 62.8 72.8 44 99.5 44c30.8 0 55.8 24.9 55.6 55.7 0 6.5-1.1 12.7-3.1 18.5-2.9-8.6-8-16.8-14.9-23.5-5.3-5.2-11.5-9.4-18.3-12.3-7.3-3.2-15.2-4.8-23.3-4.8-5.3 0-10.7.8-15.9 2.4-.4.2-.7.3-1.1.4 6.4-8.7 16.3-15.9 29.5-18.3-24.8-1.5-47.3 7.1-63 25.7Zm3.4 34.403c6.4-17.8 25.5-34.5 47.1-34.5 28.2 0 47.9 23.1 49.4 44.3-.1.2-.1.3-.1.4-9.7 13.4-25.3 22.4-42.9 23.1 1.8-14.2 8.4-31.6 13.4-36.8-11.4 7.5-21.2 19.2-29.5 35.2-6-1.5-11.6-4-16.7-7.3 4.7-15.7 13.8-30.7 20.5-38.3-9 2.5-23.1 16.6-31.5 28.9-4-4.4-7.3-9.5-9.7-15Z" clip-rule="evenodd"/>\n' +
      '  <defs>\n' +
      '    <radialGradient id="a" cx="0" cy="0" r="1" gradientTransform="rotate(49.69 -32.509 91.008) scale(111.845 622.168)" gradientUnits="userSpaceOnUse">\n' +
      '      <stop stop-color="#B67CFF"/>\n' +
      '      <stop offset=".617" stop-color="#878BFC"/>\n' +
      '      <stop offset="1" stop-color="#526EFF"/>\n' +
      '    </radialGradient>\n' +
      '  </defs>\n' +
      '</svg>',
    logo:
      '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="200" fill="none" viewBox="0 0 800 200">\n' +
      '  <path fill="#25273D" fill-rule="evenodd" d="M180.285 99.897c0-18.3 14.581-33.1 35.055-33.1 20.473 0 35.054 14.9 35.054 33.1 0 18.3-14.581 33.1-35.054 33.1-20.474 0-35.055-14.8-35.055-33.1Zm19.974 0c0 8.8 6.292 16 15.181 16 8.888 0 15.18-7.2 15.18-16s-6.292-16-15.18-16c-8.889 0-15.181 7.2-15.181 16Zm232-31.397h-19.974v62.9h19.974V68.5Zm93.778 46.898c-8.889 0-15.181 7.2-15.181 16h30.461c-.1-8.8-6.392-16-15.28-16ZM308.918 75.297c-4.395-5.5-10.786-8.5-19.176-8.5-17.477 0-30.86 14.8-30.86 33.1s13.383 33.1 30.86 33.1c8.29 0 14.681-3.1 19.176-8.6v6.9h19.974v-62.9h-19.974v6.9Zm-14.981 40.6c-8.889 0-15.18-7.2-15.18-16s6.291-16 15.18-16c8.888 0 14.981 7.2 14.981 16s-6.093 16-14.981 16Zm282.734-49.1c8.389 0 14.781 3 19.175 8.5v-6.9h19.974v62.9h-19.974v-6.9c-4.494 5.5-10.886 8.6-19.175 8.6-17.477 0-30.86-14.8-30.86-33.1s13.383-33.1 30.86-33.1Zm-10.986 33.1c0 8.8 6.292 16 15.181 16 8.888 0 14.98-7.2 14.98-16s-6.092-16-14.98-16c-8.889 0-15.181 7.2-15.181 16Zm106.063-33.1c-8.289 0-14.681 3-19.175 8.5v-6.8h-19.974v80.3h19.974v-24.3c4.394 5.5 10.786 8.6 19.175 8.6 17.477 0 30.86-14.8 30.86-33.1s-13.283-33.2-30.86-33.2Zm-4.095 49.1c-8.888 0-14.98-7.2-14.98-16s6.092-16 14.98-16c8.889 0 15.181 7.2 15.181 16s-6.292 16-15.181 16Zm68.212-40.6c4.494-5.5 10.886-8.5 19.175-8.5 17.478 0 30.86 14.9 30.86 33.2 0 18.3-13.382 33.1-30.86 33.1-8.389 0-14.78-3.1-19.175-8.6v24.3h-19.974v-80.3h19.974v6.8Zm0 24.6c0 8.8 6.092 16 14.981 16 8.888 0 15.28-7.2 15.18-16 0-8.8-6.292-16-15.18-16-8.889 0-14.981 7.2-14.981 16ZM362.749 84.2c0-2.8 2.596-4.8 7.191-4.8 5.193 0 8.488 3.3 8.488 8.1h19.375c-.898-12-6.791-20.5-27.863-20.5-21.173 0-26.866 11.1-26.866 18.6 0 14.046 13.366 17.887 23.844 20.899 6.755 1.941 12.309 3.538 12.309 7.301 0 4.1-2.996 5.9-8.688 5.9-6.292 0-9.588-4.1-9.388-8.7h-19.675c1.499 16.4 10.886 22 28.164 22 24.169 0 28.962-11.4 28.962-19.9.059-13.575-12.442-17.326-22.697-20.404-7.119-2.136-13.156-3.948-13.156-8.496Zm111.254-4.8c-4.594 0-7.19 2-7.19 4.8 0 4.55 6.041 6.361 13.171 8.499 10.264 3.076 22.782 6.83 22.782 20.401 0 8.5-4.794 19.9-28.962 19.9-17.278 0-26.666-5.6-28.164-22h19.575c-.2 4.6 3.096 8.7 9.388 8.7 5.692 0 8.688-1.8 8.688-5.9 0-3.763-5.554-5.36-12.309-7.301-10.478-3.012-23.844-6.853-23.844-20.899 0-7.5 5.793-18.6 26.865-18.6 21.073 0 26.965 8.5 27.864 20.5h-19.375c0-4.8-3.295-8.1-8.489-8.1Z" clip-rule="evenodd"/>\n' +
      '  <path fill="url(#a)" fill-rule="evenodd" d="M15 87.8C20.493 62.8 42.764 44 69.43 44c30.759 0 55.727 24.9 55.527 55.7 0 6.5-1.098 12.7-3.096 18.5-2.896-8.6-7.989-16.8-14.88-23.5-5.293-5.2-11.485-9.4-18.277-12.3-7.29-3.2-15.18-4.8-23.27-4.8-5.293 0-10.686.8-15.879 2.4-.4.2-.699.3-1.098.4 6.391-8.7 16.279-15.9 29.461-18.3C53.15 60.6 30.68 69.2 15 87.8Zm3.396 34.403c6.392-17.8 25.467-34.5 47.039-34.5 28.163 0 47.838 23.1 49.336 44.3-.1.2-.1.3-.1.4-9.687 13.4-25.267 22.4-42.844 23.1 1.797-14.2 8.389-31.6 13.382-36.8-11.385 7.5-21.172 19.2-29.462 35.2-5.992-1.5-11.584-4-16.678-7.3 4.694-15.7 13.782-30.7 20.474-38.3-8.989 2.5-23.07 16.6-31.46 28.9-3.994-4.4-7.29-9.5-9.687-15Z" clip-rule="evenodd"/>\n' +
      '  <defs>\n' +
      '    <radialGradient id="a" cx="0" cy="0" r="1" gradientTransform="rotate(49.726 -47.466 58.569) scale(111.785 621.699)" gradientUnits="userSpaceOnUse">\n' +
      '      <stop stop-color="#B67CFF"/>\n' +
      '      <stop offset=".617" stop-color="#878BFC"/>\n' +
      '      <stop offset="1" stop-color="#526EFF"/>\n' +
      '    </radialGradient>\n' +
      '  </defs>\n' +
      '</svg>\n',
    description: 'The safest place for your funds',
    gettingStartedGuide: 'https://kb.oasis.app/help',
    explore: 'https://blog.oasis.app/',
    recommendedInjectedWallets: [
      { name: 'MetaMask', url: 'https://metamask.io' },
      { name: 'Coinbase', url: 'https://wallet.coinbase.com/' },
    ],
  },
  accountCenter: {
    desktop: {
      enabled: false,
      minimal: false,
    },
    mobile: {
      enabled: false,
      minimal: false,
    },
  },
  connect: {
    autoConnectLastWallet: true,
  },
})
