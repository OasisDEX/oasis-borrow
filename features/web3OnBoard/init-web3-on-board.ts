import coinbaseModule from '@web3-onboard/coinbase'
import type { Chain, WalletInit } from '@web3-onboard/common'
import gnosisModule from '@web3-onboard/gnosis'
import injectedModule from '@web3-onboard/injected-wallets'
import ledgerModule from '@web3-onboard/ledger'
import { init } from '@web3-onboard/react'
import trezorModule from '@web3-onboard/trezor'
import walletConnectModule from '@web3-onboard/walletconnect'
import type { NetworkConfig } from 'blockchain/networks'
import { enableNetworksSet } from 'blockchain/networks'
import { getLocalAppConfig } from 'helpers/config'

const injected = injectedModule({
  custom: [],
  filter: {},
})

const walletLink = coinbaseModule()

const walletConnect = walletConnectModule({
  projectId: '832580820193ff6bae62a15dc0feff03',
  version: 2,
})

const ledger = ledgerModule({
  projectId: '832580820193ff6bae62a15dc0feff03',
  walletConnectVersion: 2,
})
const gnosis = gnosisModule()

const trezorOptions = {
  email: 'support@summer.fi',
  appUrl: 'https://summer.fi',
}
const trezor = trezorModule(trezorOptions)

const mapNetwork = (network: NetworkConfig): Chain => ({
  id: network.hexId,
  label: network.label,
  token: network.token,
  color: network.color,
  rpcUrl: network.rpcUrl,
})

const getChains = () => {
  return enableNetworksSet.map(mapNetwork)
}

const config = getLocalAppConfig('parameters').connectionMethods

const getWallets = () => {
  const wallets: WalletInit[] = []
  if (!config) {
    return wallets
  }
  if (config.gnosis) wallets.push(gnosis)
  if (config.injected) wallets.push(injected)
  if (config.walletConnect) wallets.push(walletConnect)
  if (config.walletLink) wallets.push(walletLink)
  if (config.ledger) wallets.push(ledger)
  if (config.trezor) wallets.push(trezor)
  return wallets
}

export const initWeb3OnBoard = init({
  wallets: getWallets(),
  chains: getChains(),
  appMetadata: {
    name: 'Summer.fi',
    icon: `<svg width="295" height="264" viewBox="0 0 295 264" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path fill-rule="evenodd" clip-rule="evenodd"
              d="M209.729 182.945C209.729 142.009 178.902 116.741 129.88 105.623L96.5259 99.5582C81.8702 96.526 70.752 90.4615 70.752 76.8165C70.752 62.6661 84.397 54.5801 101.58 54.5801C121.795 54.5801 134.934 66.7091 137.461 86.9239L202.654 75.8058C195.073 28.3008 158.181 0 105.117 0C51.5479 0 4.04297 28.3008 4.04297 78.3326C4.04297 119.773 34.3653 145.547 80.8594 156.665L111.182 162.73C125.332 165.762 138.977 172.332 138.977 186.482C138.977 199.622 126.343 209.224 105.117 209.224C84.9024 209.224 68.2252 198.106 65.1929 176.375L0 187.998C8.59132 234.998 51.5479 262.793 105.117 262.793C163.235 262.793 209.729 233.987 209.729 182.945ZM210.571 263.214C210.571 239.955 229.426 221.1 252.686 221.1C275.945 221.1 294.8 239.955 294.8 263.214H210.571Z"
              fill="white" />
        <path fill-rule="evenodd" clip-rule="evenodd"
              d="M209.729 182.945C209.729 142.009 178.902 116.741 129.88 105.623L96.5259 99.5582C81.8702 96.526 70.752 90.4615 70.752 76.8165C70.752 62.6661 84.397 54.5801 101.58 54.5801C121.795 54.5801 134.934 66.7091 137.461 86.9239L202.654 75.8058C195.073 28.3008 158.181 0 105.117 0C51.5479 0 4.04297 28.3008 4.04297 78.3326C4.04297 119.773 34.3653 145.547 80.8594 156.665L111.182 162.73C125.332 165.762 138.977 172.332 138.977 186.482C138.977 199.622 126.343 209.224 105.117 209.224C84.9024 209.224 68.2252 198.106 65.1929 176.375L0 187.998C8.59132 234.998 51.5479 262.793 105.117 262.793C163.235 262.793 209.729 233.987 209.729 182.945ZM210.571 263.214C210.571 239.955 229.426 221.1 252.686 221.1C275.945 221.1 294.8 239.955 294.8 263.214H210.571Z"
              fill="url(#paint0_linear_1_134)" />
        <path fill-rule="evenodd" clip-rule="evenodd"
              d="M209.729 182.945C209.729 142.009 178.902 116.741 129.88 105.623L96.5259 99.5582C81.8702 96.526 70.752 90.4615 70.752 76.8165C70.752 62.6661 84.397 54.5801 101.58 54.5801C121.795 54.5801 134.934 66.7091 137.461 86.9239L202.654 75.8058C195.073 28.3008 158.181 0 105.117 0C51.5479 0 4.04297 28.3008 4.04297 78.3326C4.04297 119.773 34.3653 145.547 80.8594 156.665L111.182 162.73C125.332 165.762 138.977 172.332 138.977 186.482C138.977 199.622 126.343 209.224 105.117 209.224C84.9024 209.224 68.2252 198.106 65.1929 176.375L0 187.998C8.59132 234.998 51.5479 262.793 105.117 262.793C163.235 262.793 209.729 233.987 209.729 182.945ZM210.571 263.214C210.571 239.955 229.426 221.1 252.686 221.1C275.945 221.1 294.8 239.955 294.8 263.214H210.571Z"
              fill="url(#paint1_linear_1_134)" />
        <defs>
              <linearGradient id="paint0_linear_1_134" x1="294.805" y1="234.539" x2="4.02926" y2="233.818"
                    gradientUnits="userSpaceOnUse">
                    <stop stop-color="#007DA3" />
                    <stop offset="0.578125" stop-color="#E7A77F" />
                    <stop offset="1" stop-color="#E97047" />
              </linearGradient>
              <linearGradient id="paint1_linear_1_134" x1="0" y1="0" x2="334.306" y2="195.743"
                    gradientUnits="userSpaceOnUse">
                    <stop stop-color="#0689AD" />
                    <stop offset="0.557292" stop-color="#E7A77F" />
                    <stop offset="1" stop-color="#E97047" />
              </linearGradient>
        </defs>
    </svg>
    `,
    logo: `<svg width="1532" height="262" viewBox="0 0 1532 262" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path fill-rule="evenodd" clip-rule="evenodd"
        d="M1409.29 79.26V66.6048C1409.29 46.8123 1423.68 42.1041 1434.15 42.1041H1449.26V3.59864C1445.3 1.79932 1435.59 0 1425.48 0C1386.23 0 1361 25.9402 1361 65.915V79.29H1335.9V120.195H1361V256.883H1409.44V120.195H1476.67V256.883H1525.1V79.26H1409.29ZM499.041 97.0433C512.054 83.1014 531.031 74.9749 555.525 74.9716C605.777 74.9783 636.209 109.163 636.209 157.5V256.883H587.778V153.542C587.778 130.78 574.373 119.445 555.51 119.445C536.647 119.445 523.242 130.81 523.242 153.542V256.883H474.81V153.542C474.81 130.78 461.405 119.445 442.543 119.445C423.68 119.445 410.275 130.81 410.275 153.542V256.883H361.843V157.5C361.843 109.129 392.282 74.9716 442.543 74.9716C467.043 74.9716 486.026 83.1285 499.041 97.0433ZM96.1736 151.653C93.1048 151.003 90.0815 150.39 87.0524 149.777C81.5566 148.664 76.042 147.548 70.2034 146.195C57.3383 143.196 50.9807 139.057 50.9807 128.981C50.9807 118.905 61.5667 111.348 74.7617 111.348C95.9037 111.348 101.721 124.663 103.221 135.129L147.274 126.132C144.995 107.059 127.272 75.0016 74.4018 75.0016C34.367 75.0016 4.91814 101.302 4.91814 132.97C4.91814 164.638 29.3889 179.602 53.2598 185.63C58.5293 186.963 62.9209 187.952 67.2784 188.934L67.2797 188.934C71.0557 189.785 74.8061 190.629 79.0801 191.687C92.1251 194.926 101.602 197.565 101.602 206.832C101.602 216.098 93.6545 224.465 77.0408 224.465C55.1491 224.465 46.9022 211.51 45.7627 197.715L0 206.712C2.27914 226.624 21.5318 261.201 77.4307 261.201C126.162 261.201 149.553 232.442 149.553 203.623C149.553 173.334 132.31 159.39 96.1736 151.683V151.653ZM287.651 182.601C287.651 205.332 272.807 216.698 253.914 216.698C235.021 216.698 220.177 205.362 220.177 182.601V79.26H171.745V178.642C171.745 226.984 203.653 261.171 253.914 261.171C304.175 261.171 336.083 227.014 336.083 178.642V79.26H287.651V182.601ZM858.365 74.9716C833.879 74.9782 814.906 83.1042 801.896 97.0433C788.881 83.1285 769.899 74.9716 745.398 74.9716C695.137 74.9716 664.698 109.129 664.698 157.5V256.883H713.13V153.542C713.13 130.81 726.535 119.445 745.398 119.445C764.261 119.445 777.666 130.78 777.666 153.542V256.883H826.097V153.542C826.097 130.81 839.502 119.445 858.365 119.445C877.228 119.445 890.633 130.78 890.633 153.542V256.883H939.065V157.5C939.065 109.168 908.638 74.9852 858.365 74.9716ZM1212.14 107.479C1219.4 89.4561 1240.6 77.1008 1260.93 77.1008H1260.96C1266.93 77.1008 1272.21 77.8205 1276.74 79.26V120.165H1261.71C1235.92 120.165 1216.1 137.858 1216.1 168.236V256.853H1167.67V79.26H1212.14V107.479ZM1466.89 42.134C1466.89 23.876 1481.58 9.18469 1499.45 9.17653C1517.31 9.18476 1532 23.8761 1532 42.134H1466.89ZM1499.45 9.17653L1499.46 9.17653H1499.43L1499.45 9.17653ZM1288.54 223.925C1270.67 223.933 1255.98 238.625 1255.98 256.883H1321.09C1321.09 238.625 1306.4 223.933 1288.54 223.925ZM1057.04 220.117C1079.05 220.117 1090.78 208.241 1096.98 193.547L1139.18 207.401C1129.1 236.94 1100.49 261.171 1056.68 261.171C1006.42 261.171 962.156 226.234 962.156 166.467C962.156 109.938 1005.34 74.9716 1052.21 74.9716C1108.77 74.9716 1142.63 109.668 1142.63 166.557C1142.63 171.719 1142.2 176.215 1141.99 178.418C1141.92 179.132 1141.88 179.606 1141.88 179.782H1010.92C1012.03 203.203 1032.48 220.117 1057.04 220.117ZM1093.87 148.804C1093.12 131.14 1081.21 113.867 1052.93 113.867C1027.26 113.867 1013.11 132.61 1012 148.804H1093.87Z"
        fill="url(#paint0_linear_4_24)" />
      <defs>
        <linearGradient id="paint0_linear_4_24" x1="1532.03" y1="232.745" x2="21.1848" y2="213.117"
          gradientUnits="userSpaceOnUse">
          <stop stop-color="#007DA3" />
          <stop offset="0.578125" stop-color="#E7A77F" />
          <stop offset="1" stop-color="#E97047" />
        </linearGradient>
      </defs>
    </svg>
    `,
    description: 'The safest place for your funds',
    gettingStartedGuide: 'https://docs.summer.fi/',
    explore: 'https://blog.summer.fi/',
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
