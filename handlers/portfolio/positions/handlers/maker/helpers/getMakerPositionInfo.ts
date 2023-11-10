import type { Vault } from '@prisma/client'
import { NetworkIds, NetworkNames } from 'blockchain/networks'
import { OmniProductType } from 'features/omni-kit/types'
import { getBorrowishPositionType } from 'handlers/portfolio/positions/helpers'
import { LendingProtocol } from 'lendingProtocols'

interface getMakerPositionInfoParams {
  apiVaults: Vault[]
  cdp: string
  type: string
}

export async function getMakerPositionInfo({ apiVaults, cdp, type }: getMakerPositionInfoParams) {
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
  const url = `/${NetworkNames.ethereumMainnet}/${LendingProtocol.Maker}/${cdp}`

  // prices for oracle positions is always equal to one

  return {
    type: resolvedType,
    url,
  }
}
