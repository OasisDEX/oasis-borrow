import { NetworkIds } from 'blockchain/networks'
import { useLocalStorage } from 'helpers/useLocalStorage'
import { Dispatch, SetStateAction } from 'react'

const localStorageKeyForDefaultChain = 'legacy-default-chain'

// This is a hack. We need that because some part of our app (from AppContext) uses the chain id from first render.
export function useLegacyDefaultChain(): [NetworkIds, Dispatch<SetStateAction<NetworkIds>>] {
  const [state, setState] = useLocalStorage<NetworkIds>(
    localStorageKeyForDefaultChain,
    NetworkIds.MAINNET,
    (value): value is NetworkIds => {
      return [NetworkIds.MAINNET, NetworkIds.GOERLI].includes(value ?? 0)
    },
  )

  const setter: Dispatch<SetStateAction<NetworkIds>> = (action) => {
    const valueToSet = typeof action === 'function' ? action(state) : action
    if (valueToSet === NetworkIds.MAINNET || valueToSet === NetworkIds.GOERLI) {
      return setState(valueToSet)
    }
  }

  return [state, setter]
}
