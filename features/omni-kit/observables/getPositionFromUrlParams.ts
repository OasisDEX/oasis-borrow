import { getTokenSymbolBasedOnAddress } from 'blockchain/tokensMetadata'
import {
  extractLendingProtocolFromPositionCreatedEvent,
  type PositionCreated,
} from 'features/aave/services/read-position-created-events'
import type { OmniSupportedNetworkIds } from 'features/omni-kit/types'
import type { SubgraphsResponses } from 'features/subgraphLoader/types'
import { loadSubgraph } from 'features/subgraphLoader/useSubgraphLoader'
import type { LendingProtocol } from 'lendingProtocols'

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

interface GetPositionFromUrlDataParams {
  networkId: OmniSupportedNetworkIds
  positionId: number
  protocol: LendingProtocol
}

interface GetPositionFromUrlDataResponse {
  dpmAddress: string
  owner: string
  positions: PositionCreated[]
}

export async function getPositionsFromUrlData({
  networkId,
  positionId,
  protocol,
}: GetPositionFromUrlDataParams): Promise<GetPositionFromUrlDataResponse> {
  switch (protocol) {
    default:
      const { response } = (await loadSubgraph('SummerDpm', 'getUserCreateEvents', networkId, {
        positionId,
      })) as SubgraphsResponses['SummerDpm']['getUserCreateEvents']

      return {
        dpmAddress: response.accounts[0]?.id,
        owner: response.accounts[0]?.user.id,
        positions: response.accounts
          .map(({ createEvents, id }) =>
            createEvents.map(
              ({ collateralToken, debtToken, positionType, protocol: _protocol }) => ({
                positionType: positionType as 'Borrow' | 'Multiply' | 'Earn',
                collateralTokenSymbol: getTokenSymbolBasedOnAddress(networkId, collateralToken),
                collateralTokenAddress: collateralToken,
                debtTokenSymbol: getTokenSymbolBasedOnAddress(networkId, debtToken),
                debtTokenAddress: debtToken,
                protocol: extractLendingProtocolFromPositionCreatedEvent(_protocol),
                protocolRaw: _protocol,
                chainId: networkId,
                proxyAddress: id,
              }),
            ),
          )
          .flat(),
      }
  }
}
