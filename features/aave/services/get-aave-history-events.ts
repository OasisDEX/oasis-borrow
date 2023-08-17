import { NetworkIds } from 'blockchain/networks'
import { AaveHistoryEvent } from 'features/ajna/history/types'

export function getAaveHistoryEvents(
  _proxyAdrress: string,
  _networkId: NetworkIds,
): Promise<AaveHistoryEvent[]> {
  return Promise.resolve([])
}
