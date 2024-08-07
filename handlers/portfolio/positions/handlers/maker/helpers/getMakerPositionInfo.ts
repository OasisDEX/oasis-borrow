import type { Vault } from '@prisma/client'
import BigNumber from 'bignumber.js'
import { NetworkIds, NetworkNames } from 'blockchain/networks'
import type { OmniProductBorrowishType } from 'features/omni-kit/types'
import { OmniProductType } from 'features/omni-kit/types'
import type { MakerDiscoverPositionsIlk } from 'handlers/portfolio/positions/handlers/maker/types'
import type { TokensPricesList } from 'handlers/portfolio/positions/helpers'
import { getBorrowishPositionType } from 'handlers/portfolio/positions/helpers'
import { getTokenDisplayName } from 'helpers/getTokenDisplayName'
import { LendingProtocol } from 'lendingProtocols'

interface getMakerPositionInfoParams {
  apiVaults: Vault[]
  cdp: string
  ilk: MakerDiscoverPositionsIlk
  normalizedDebt: string
  prices: TokensPricesList
  type: string
}

export async function getMakerPositionInfo({
  apiVaults,
  cdp,
  ilk,
  normalizedDebt,
  prices,
  type,
}: getMakerPositionInfoParams) {
  const {
    ilk: ilkLabel,
    pip: { value },
    rate,
    tokenSymbol: rawTokenSymbol,
  } = ilk

  const tokenSymbol = rawTokenSymbol === 'PAX' ? 'USDP' : rawTokenSymbol

  // determine position type based on subgraph and db responses
  const resolvedType =
    type === 'Guni' || tokenSymbol === 'G-UNI'
      ? OmniProductType.Earn
      : getBorrowishPositionType({
          apiVaults,
          defaultType: type.toLowerCase() as OmniProductBorrowishType,
          networkId: NetworkIds.MAINNET,
          positionId: Number(cdp),
          protocol: LendingProtocol.Maker,
        })

  // shorhands and formatting for better clarity
  const collateralPrice = new BigNumber(value)
  const daiPrice = new BigNumber(prices['DAI'])
  const debt = new BigNumber(normalizedDebt).times(rate)
  const [earnToken] = ilkLabel.split('-')
  const primaryToken = resolvedType === OmniProductType.Earn ? earnToken : tokenSymbol.toUpperCase()
  const secondaryToken = resolvedType === OmniProductType.Earn ? earnToken : 'DAI'
  const url = `/${NetworkNames.ethereumMainnet}/${LendingProtocol.Maker}/${cdp}`

  return {
    collateralPrice,
    daiPrice,
    debt,
    primaryToken: getTokenDisplayName(primaryToken),
    secondaryToken,
    type: resolvedType,
    url,
  }
}
