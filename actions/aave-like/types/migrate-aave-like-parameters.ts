import type { AaveLikePosition } from '@oasisdex/dma-library'
import type { NetworkIds } from 'blockchain/networks'
import type { ReserveData } from 'features/aave/types'
import type { AaveLikeLendingProtocol } from 'lendingProtocols'

export interface MigrateAaveLikeParameters {
  position: AaveLikePosition,
  networkId: NetworkIds,
  dpmAccount: string,
  sourceAddress: string,
  userAddress: string,
  protocol: AaveLikeLendingProtocol,

}
