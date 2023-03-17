import { useSetChain } from '@web3-onboard/react'
import { networksList } from 'blockchain/networksList'

export function useNetworkName() {
  const [{ chains, connectedChain }] = useSetChain()
  const filteredChain = chains.filter(({ id }) => id === connectedChain?.id)
  if (!filteredChain[0]) {
    throw new Error(`Chain not configured:
    ${JSON.stringify({ chains, connectedChain }, null, 4)}`)
  }
  return filteredChain[0].label as keyof typeof networksList
}
