import { ethers } from 'ethers'
import { useEffect, useState } from 'react'

export function useENS(address: string) {
  const infuraUrlBackend = `https://mainnet.infura.io/v3/${'de82b2d602264e4fbc0929dec0c45baa'}`
  const provider = new ethers.providers.JsonRpcProvider(infuraUrlBackend)
  const [ensName, setENSName] = useState<string | null>(null)

  useEffect(() => {
    async function resolveENS() {
      if (ethers.utils.isAddress(address)) {
        const ensName = await provider.lookupAddress(address)
        if (ensName) setENSName(ensName)
      }
    }
    resolveENS()
  }, [address])

  return { ensName }
}
