import { type Chain, getChainInfoByChainId, makeSDK, type User } from '@summerfi/sdk-client'
import { Address, Wallet } from '@summerfi/sdk-common/dist/common'
import { useEffect, useState } from 'react'

export function useSdk(address: string, chainId: number) {
  const sdk = makeSDK()
  const wallet = Wallet.createFrom({
    address: Address.createFrom({ value: address }),
  })

  const [error, setError] = useState<null | any>(null)
  const [user, setUser] = useState<null | User>(null)
  const [chain, setChain] = useState<null | Chain>(null)

  useEffect(() => {
    const fetchData = async () => {
      const fetchedChain = await sdk.chains.getChain({
        chainInfo: getChainInfoByChainId(chainId),
      })
      setChain(fetchedChain)

      const fetchedUser = await sdk.users.getUser({ chain: fetchedChain, wallet })
      setUser(fetchedUser)
    }

    void fetchData().catch((err) => {
      setError(err)
    })
  }, [sdk, chainId, address, wallet])

  // TODO: Implement the rest of the logic here when the SDK is ready
  return { user, chain, error }
}
