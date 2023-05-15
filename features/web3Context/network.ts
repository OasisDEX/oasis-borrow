import { networksByName } from 'blockchain/networksConfig'
import { hardhatNetworkConfigs } from 'features/web3OnBoard/hardhatConfigList'
import { CustomNetworkStorageKey, mainnetNetworkParameter } from 'helpers/getCustomNetworkParameter'
import { NetworkNames } from 'helpers/networkNames'
import { useFeatureToggle } from 'helpers/useFeatureToggle'
import { getStorageValue } from 'helpers/useLocalStorage'
import { isNull, isUndefined, keyBy, memoize } from 'lodash'
import Web3 from 'web3'
export interface ContractDesc {
  abi: any
  address: string
}

const web3s: Web3[] = []
export const contract: any = memoize(
  (web3: Web3, { abi, address }: ContractDesc) => new web3.eth.Contract(abi.default, address),
  (web3: Web3, { address }: ContractDesc) => {
    if (!address) {
      throw new Error('Contract address is not defined')
    }
    if (web3s.indexOf(web3) < 0) {
      web3s[web3s.length] = web3
    }
    return `${web3s.indexOf(web3)}${address}`
  },
)

export function getNetworkName(): string {
  const name = 'network'
  const defaultNetwork = NetworkNames.ethereumMainnet
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const useNetworkSwitcher = useFeatureToggle('UseNetworkSwitcher') // not a hook :)
  const customNetworkData = getStorageValue<typeof mainnetNetworkParameter>(
    CustomNetworkStorageKey,
    '',
  )
  if (useNetworkSwitcher && customNetworkData) {
    return customNetworkData.network || defaultNetwork
  }
  const matchesIfFound = RegExp('[?&]' + name + '=([^&]*)').exec(window.location.search)
  if (isNull(matchesIfFound)) {
    return defaultNetwork
  }
  const networkName = decodeURIComponent(matchesIfFound[1].replace(/\+/g, ' '))
  if (isUndefined(networksByName[networkName])) {
    throw new Error(`Unsupported network in URL param: ${networkName}`)
  }
  return networkName
}

export function getNetworkId(): number {
  const networkName = getNetworkName()
  return Number({ ...networksByName, ...keyBy(hardhatNetworkConfigs, 'name') }[networkName].id)
}
