import { type Chain, makeSDK, type User } from '@summerfi/sdk-client'
import { Address, type AddressValue, Wallet } from '@summerfi/sdk-common/dist/common'
import { getChainInfoByChainId } from '@summerfi/sdk-common/dist/common/implementation/ChainFamilies'
import { useEffect, useState } from 'react'

export function useSdk(address: AddressValue, chainId: number) {
  const sdk = makeSDK({ apiURL: '/api/sdk' })
  const wallet = Wallet.createFrom({
    address: Address.createFrom({ value: address }),
  })

  const [error, setError] = useState<null | string>(null)
  const [user, setUser] = useState<null | User>(null)
  const [chain, setChain] = useState<null | Chain>(null)

  useEffect(() => {
    const fetchData = async () => {
      const fetchedChain = await sdk.chains.getChain({
        chainInfo: getChainInfoByChainId(chainId),
      })
      setChain(fetchedChain)

      const fetchedUser = await sdk.users.getUser({
        chainInfo: fetchedChain,
        walletAddress: wallet.address,
      })
      setUser(fetchedUser)
    }

    void fetchData().catch((err) => {
      setError(err.message)
    })
  }, [sdk, chainId, address, wallet])

  return { error, sdk, user, chain }
}
