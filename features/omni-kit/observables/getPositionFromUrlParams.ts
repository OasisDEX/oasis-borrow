import { ADDRESS_ZERO } from '@oasisdex/addresses'
import { identifyTokens$ } from 'blockchain/identifyTokens'
import { type NetworkConfig, networkSetById } from 'blockchain/networks'
import { getTokenSymbolBasedOnAddress } from 'blockchain/tokensMetadata'
import { getUserDpmProxy } from 'blockchain/userDpmProxies'
import {
  extractLendingProtocolFromPositionCreatedEvent,
  getPositionCreatedEventForProxyAddress,
  type PositionCreated,
  type PositionType,
} from 'features/aave/services'
import { getMorphoPositionWithPairId } from 'features/omni-kit/protocols/morpho-blue/helpers'
import type { SubgraphsResponses } from 'features/subgraphLoader/types'
import { loadSubgraph } from 'features/subgraphLoader/useSubgraphLoader'
import { LendingProtocol } from 'lendingProtocols'
import { uniq } from 'lodash'

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

export interface AccountWithCreateEvents {
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
}

export interface UserCreateEventsResponse {
  accounts: AccountWithCreateEvents[]
}

export interface PositionFromUrl extends PositionCreated {
  pairId: number
}

interface GetPositionFromUrlDataParams {
  networkId: number
  pairId: number
  positionId: number
  protocol: LendingProtocol
  network?: NetworkConfig
}

interface GetAccountByPositionIdParams {
  networkId: number
  positionId: number
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
  const accounts = await getAccounts({ networkId, positionId })

  if (!accounts) return emptyResponse

  if (accounts.length > 0) {
    const account = accounts[0]

    void (await identifyTokens$(
      networkId,
      uniq(
        account.createEvents.flatMap(({ collateralToken, debtToken }) => [
          collateralToken,
          debtToken,
        ]),
      ),
    ).toPromise())

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

/**
 * Retrieves accounts based on the network and position ID.
 *
 * @dev if the network is a custom fork, the accounts are retrieved from the blochchain events.
 * Otherwise, the accounts are retrieved from the subgraph.
 * @param networkId - The network chain Id.
 * @param positionId - The position ID.
 * @returns An array of accounts or null if the accounts cannot be retrieved.
 */
async function getAccounts({ networkId, positionId }: GetAccountByPositionIdParams) {
  const network = networkSetById[networkId]
  if (network && network.isCustomFork) {
    const dpm = await getUserDpmProxy(positionId, network.id)
    if (!dpm) return null

    const createEvents = await getPositionCreatedEventForProxyAddress(network.id, dpm.proxy)
    if (createEvents.length === 0) return null

    return [
      {
        createEvents: createEvents.map((e) => ({
          collateralToken: e.args.collateralToken.toLowerCase(),
          debtToken: e.args.debtToken.toLowerCase(),
          positionType: e.args.positionType.toLowerCase(),
          protocol: e.args.protocol,
        })),
        id: dpm.proxy.toLowerCase(),
        user: {
          id: dpm.user.toLowerCase(),
        },
      },
    ]
  } else {
    const response = (await loadSubgraph('SummerDpm', 'getUserCreateEvents', networkId, {
      positionId,
    })) as SubgraphsResponses['SummerDpm']['getUserCreateEvents']
    if (!response.success) return null
    return response.response.accounts
  }
}
