import type BigNumber from 'bignumber.js'
import { tokenBalance } from 'blockchain/better-calls/erc20'
import { ensureContractsExist, getNetworkContracts } from 'blockchain/contracts'
import type { NetworkIds } from 'blockchain/networks'
import { useEffect, useState } from 'react'

type BalancerLiquidityProps = {
  tokenSymbol: string
  networkId: NetworkIds
}
export const useBalancerVaultLiquidity = ({ tokenSymbol, networkId }: BalancerLiquidityProps) => {
  const [liquidity, setLiquidity] = useState<BigNumber | null>(null)
  const contracts = getNetworkContracts(networkId)
  ensureContractsExist(networkId, contracts, ['balancerVault'])

  const tokenToCheck = tokenSymbol === 'ETH' ? 'WETH' : tokenSymbol.toUpperCase()
  const { balancerVault } = contracts

  useEffect(() => {
    tokenBalance({ token: tokenToCheck, account: balancerVault.address, networkId })
      .then((result) => {
        setLiquidity(result)
      })
      .catch((error) => {
        console.error(error)
      })
  }, [tokenToCheck, balancerVault.address, networkId])

  return liquidity
}
