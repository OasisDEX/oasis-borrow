import { ADDRESS_ZERO } from '@oasisdex/addresses'
import { getTokenSymbolBasedOnAddress } from 'blockchain/tokensMetadata'
import {
  extractLendingProtocolFromPositionCreatedEvent,
  type PositionCreated,
  type PositionType,
} from 'features/aave/services'
import { getMorphoPositionWithPairId } from 'features/omni-kit/protocols/morpho-blue/helpers'
import type { OmniSupportedNetworkIds } from 'features/omni-kit/types'
import type { SubgraphsResponses } from 'features/subgraphLoader/types'
import { loadSubgraph } from 'features/subgraphLoader/useSubgraphLoader'
import { LendingProtocol } from 'lendingProtocols'

export interface MorphoVauldIdPositionsResponse {
  accounts: {
    borrowPositions: {
      market: {
        collateralToken: {
          address: string
          symbol: string
        }
        debtToken: {
          address: string
          symbol: string
        }
        id: string
      }
    }[]
    id: string
    positionType: string
    protocol: string
    user: {
      id: string
    }
  }[]
}

export interface UserCreateEventsResponse {
  accounts: {
    createEvents: {
      collateralToken: string
      debtToken: string
      positionType: string
      protocol: string
    }[]
    id: string
    user: {
      id: string
    }
  }[]
}

export interface PositionFromUrl extends PositionCreated {
  pairId: number
}

interface GetPositionFromUrlDataParams {
  networkId: OmniSupportedNetworkIds
  pairId: number
  positionId: number
  protocol: LendingProtocol
}

interface GetPositionFromUrlDataResponse {
  dpmAddress: string
  owner: string
  positions: PositionFromUrl[]
}

const emptyResponse = {
  dpmAddress: ADDRESS_ZERO,
  owner: ADDRESS_ZERO,
  positions: [],
}

export async function getPositionsFromUrlData({
  networkId,
  pairId,
  positionId,
  protocol,
}: GetPositionFromUrlDataParams): Promise<GetPositionFromUrlDataResponse> {
  const {
    response: { accounts },
  } = (await loadSubgraph('SummerDpm', 'getUserCreateEvents', networkId, {
    positionId,
  })) as SubgraphsResponses['SummerDpm']['getUserCreateEvents']

  if (accounts.length > 0) {
    const account = accounts[0]
    const data = {
      dpmAddress: account.id,
      owner: account.user.id,
      positions: account.createEvents.map(
        ({ collateralToken, debtToken, positionType, protocol: _protocol }) => ({
          chainId: networkId,
          collateralTokenAddress: collateralToken,
          collateralTokenSymbol: getTokenSymbolBasedOnAddress(networkId, collateralToken),
          debtTokenAddress: debtToken,
          debtTokenSymbol: getTokenSymbolBasedOnAddress(networkId, debtToken),
          pairId,
          positionType: positionType as PositionType,
          protocol: extractLendingProtocolFromPositionCreatedEvent(_protocol),
          protocolRaw: _protocol,
          proxyAddress: account.id,
        }),
      ),
    }

    switch (protocol) {
      case LendingProtocol.MorphoBlue:
        const { response: morphoResponse } = (await loadSubgraph(
          'Morpho',
          'getMorphoVauldIdPositions',
          networkId,
          {
            positionId,
          },
        )) as SubgraphsResponses['Morpho']['getMorphoVauldIdPositions']

        // return position as is except for checking positions market id with internal config to determine its index
        // only for morpho blue items
        return {
          ...data,
          positions: data.positions.map((position) =>
            getMorphoPositionWithPairId({
              networkId,
              pairId,
              position,
              response: morphoResponse,
            }),
          ),
        }
      default:
        return data
    }
  } else return emptyResponse
}
