import type { Vault } from '@prisma/client'
import { getNetworkContracts } from 'blockchain/contracts'
import { NetworkIds, NetworkNames } from 'blockchain/networks'
import { getTokenPrice } from 'blockchain/prices'
import type { Tickers } from 'blockchain/prices.types'
import { isPoolOracless } from 'features/ajna/common/helpers/isOracless'
import { OmniProductType } from 'features/omni-kit/types'
import type { AjnaDpmPositionsPool } from 'handlers/portfolio/positions/handlers/ajna/types'
import { getBorrowishPositionType } from 'handlers/portfolio/positions/helpers'
import { one } from 'helpers/zero'
import { LendingProtocol } from 'lendingProtocols'

interface getAjnaPositionInfoParams {
  apiVaults: Vault[]
  isEarn: boolean
  pool: AjnaDpmPositionsPool
  positionId: string
  tickers: Tickers
}

export async function getAjnaPositionInfo({
  apiVaults,
  isEarn,
  pool: { address: poolAddress, collateralToken, quoteToken },
  positionId,
  tickers,
}: getAjnaPositionInfoParams) {
  // get pool info contract
  const { ajnaPoolInfo } = getNetworkContracts(NetworkIds.MAINNET)

  // determine position type based on subgraph and db responses
  const type = isEarn
    ? OmniProductType.Earn
    : getBorrowishPositionType({
        apiVaults,
        networkId: NetworkIds.MAINNET,
        positionId: Number(positionId),
        protocol: LendingProtocol.Ajna,
      })

  // shorhands and formatting for better clarity
  const primaryToken = collateralToken.symbol.toUpperCase()
  const primaryTokenAddress = collateralToken.address
  const secondaryToken = quoteToken.symbol.toUpperCase()
  const secondaryTokenAddress = quoteToken.address
  const isOracless = isPoolOracless({
    chainId: NetworkIds.MAINNET,
    collateralToken: primaryToken,
    quoteToken: secondaryToken,
  })
  const url = `${NetworkNames.ethereumMainnet}/ajna/${type}/${
    isOracless ? primaryTokenAddress : primaryToken
  }-${isOracless ? secondaryTokenAddress : secondaryToken}/${positionId}`

  // prices for oracle positions is always equal to one
  const collateralPrice = isOracless ? one : getTokenPrice(primaryToken, tickers)
  const quotePrice = isOracless ? one : getTokenPrice(secondaryToken, tickers)

  return {
    ajnaPoolInfo,
    collateralPrice,
    isOracless,
    poolAddress,
    primaryToken,
    quotePrice,
    secondaryToken,
    type,
    url,
  }
}
