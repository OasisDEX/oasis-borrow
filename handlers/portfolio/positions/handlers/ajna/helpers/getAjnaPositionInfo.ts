import type { Vault } from '@prisma/client'
import BigNumber from 'bignumber.js'
import { getNetworkContracts } from 'blockchain/contracts'
import { NetworkIds, NetworkNames } from 'blockchain/networks'
import { isPoolOracless } from 'features/ajna/common/helpers/isOracless'
import { OmniProductType } from 'features/omni-kit/types'
import type { AjnaDpmPositionsPool } from 'handlers/portfolio/positions/handlers/ajna/types'
import type { TokensPrices } from 'handlers/portfolio/positions/helpers'
import { getBorrowishPositionType } from 'handlers/portfolio/positions/helpers'
import { getTokenDisplayName } from 'helpers/getTokenDisplayName'
import { one } from 'helpers/zero'
import { LendingProtocol } from 'lendingProtocols'

interface getAjnaPositionInfoParams {
  apiVaults: Vault[]
  isEarn: boolean
  pool: AjnaDpmPositionsPool
  positionId: string
  prices: TokensPrices
}

export async function getAjnaPositionInfo({
  apiVaults,
  isEarn,
  pool: { address: poolAddress, collateralToken, quoteToken },
  positionId,
  prices,
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
  const url = `/${NetworkNames.ethereumMainnet}/${LendingProtocol.Ajna}/${type}/${
    isOracless ? primaryTokenAddress : primaryToken
  }-${isOracless ? secondaryTokenAddress : secondaryToken}/${positionId}`

  // prices for oracle positions is always equal to one
  const collateralPrice = isOracless ? one : new BigNumber(prices[primaryToken])
  const quotePrice = isOracless ? one : new BigNumber(prices[secondaryToken])

  return {
    ajnaPoolInfo,
    collateralPrice,
    isOracless,
    poolAddress,
    primaryToken: getTokenDisplayName(primaryToken),
    quotePrice,
    secondaryToken: getTokenDisplayName(secondaryToken),
    type,
    url,
  }
}
