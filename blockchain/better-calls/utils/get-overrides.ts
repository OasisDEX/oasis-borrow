import type { ethers, PayableOverrides } from 'ethers'
import { SafeProxy__factory } from 'types/ethers-contracts'

export async function getOverrides(
  signer: ethers.Signer,
): Promise<Pick<PayableOverrides, 'accessList' | 'type'>> {
  // check if signer is a wallet or contract
  const provider = signer.provider
  if (!provider) {
    throw new Error('Signer has no provider')
  }

  const address = await signer.getAddress()

  const code = await provider.getCode(address)
  if (code === '0x') {
    // it's a walelt
    return {}
  }

  const safeProxy = SafeProxy__factory.connect(address, provider)

  const version = await safeProxy.VERSION()

  if (version === '1.3.0') {
    return {
      type: 1,
      accessList: [
        {
          address: address,
          storageKeys: ['0x0000000000000000000000000000000000000000000000000000000000000000'],
        },
        {
          address: '0xd9Db270c1B5E3Bd161E8c8503c55cEABeE709552', // master proxy for all networks has the same address
          storageKeys: [],
        },
      ],
    }
  }

  return {}
}
