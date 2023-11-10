import { getNetworkContracts } from 'blockchain/contracts'
import { getNetworkById, NetworkIds } from 'blockchain/networks'
import { getTokenPrice } from 'blockchain/prices'
import type { Tickers } from 'blockchain/prices.types'
import { isPoolOracless } from 'features/ajna/common/helpers/isOracless'
import type { OmniProductType } from 'features/omni-kit/types'
import type { AjnaDpmPositionsPool } from 'handlers/portfolio/positions/handlers/ajna/types'
import { one } from 'helpers/zero'
import { LendingProtocol } from 'lendingProtocols'
import { prisma } from 'server/prisma'

interface getAjnaPositionInfoParams {
  isEarn: boolean
  pool: AjnaDpmPositionsPool
  positionId: string
  tickers: Tickers
}

export async function getAjnaPositionInfo({
  isEarn,
  pool: { address: poolAddress, collateralToken, quoteToken },
  positionId,
  tickers,
}: getAjnaPositionInfoParams) {
  // get pool info contract
  const { ajnaPoolInfo } = getNetworkContracts(NetworkIds.MAINNET)

  // get info from db if borrow positions was changed into multiply
  const apiVaults = await prisma.vault.findMany({
    where: {
      vault_id: { equals: Number(positionId) },
      chain_id: { equals: NetworkIds.MAINNET },
      protocol: { equals: LendingProtocol.Ajna },
    },
  })

  // determine position type based on subgraph and db responses
  const type = (isEarn ? 'earn' : apiVaults[0]?.type ?? 'borrow') as OmniProductType

  // shorhands and formatting for better clarity
  const primaryToken = collateralToken.symbol.toUpperCase()
  const primaryTokenAddress = collateralToken.address
  const secondaryToken = quoteToken.symbol.toUpperCase()
  const secondaryTokenAddress = quoteToken.address
  const network = getNetworkById(NetworkIds.MAINNET).name
  const isOracless = isPoolOracless({
    chainId: NetworkIds.MAINNET,
    collateralToken: primaryToken,
    quoteToken: secondaryToken,
  })
  const url = `${network}/ajna/${type}/${isOracless ? primaryTokenAddress : primaryToken}-${
    isOracless ? secondaryTokenAddress : secondaryToken
  }/${positionId}`

  // prices for oracle positions is always equal to one
  const collateralPrice = isOracless ? one : getTokenPrice(primaryToken, tickers)
  const quotePrice = isOracless ? one : getTokenPrice(secondaryToken, tickers)

  return {
    ajnaPoolInfo,
    collateralPrice,
    isOracless,
    network,
    poolAddress,
    primaryToken,
    quotePrice,
    secondaryToken,
    type,
    url,
  }
}
