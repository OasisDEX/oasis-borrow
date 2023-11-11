import type { Vault } from '@prisma/client'
import BigNumber from 'bignumber.js'
import { NetworkIds, NetworkNames } from 'blockchain/networks'
import { getTokenPrice } from 'blockchain/prices'
import type { Tickers } from 'blockchain/prices.types'
import { OmniProductType } from 'features/omni-kit/types'
import type { MakerDiscoverPositionsIlk } from 'handlers/portfolio/positions/handlers/maker/types'
import { getBorrowishPositionType } from 'handlers/portfolio/positions/helpers'
import { LendingProtocol } from 'lendingProtocols'

interface getMakerPositionInfoParams {
  apiVaults: Vault[]
  cdp: string
  ilk: MakerDiscoverPositionsIlk
  tickers: Tickers
  type: string
}

export async function getMakerPositionInfo({
  apiVaults,
  cdp,
  ilk,
  tickers,
  type,
}: getMakerPositionInfoParams) {
  const {
    pip: { value },
    tokenSymbol,
  } = ilk

  // determine position type based on subgraph and db responses
  const resolvedType =
    type === 'earn'
      ? OmniProductType.Earn
      : getBorrowishPositionType({
          apiVaults,
          networkId: NetworkIds.MAINNET,
          positionId: Number(cdp),
          protocol: LendingProtocol.Maker,
        })

  // shorhands and formatting for better clarity
  const daiPrice = getTokenPrice('DAI', tickers)
  const collateralPrice = new BigNumber(value)
  const primaryToken = tokenSymbol === 'WETH' ? 'ETH' : tokenSymbol.toUpperCase()
  const url = `/${NetworkNames.ethereumMainnet}/${LendingProtocol.Maker}/${cdp}`

  return {
    daiPrice,
    collateralPrice,
    primaryToken,
    type: resolvedType,
    url,
  }
}
