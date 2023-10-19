import type { IPosition } from '@oasisdex/dma-library'

import type { AaveLikeReserveData } from './aave-like-reserve-data'

export interface AaveLikeProtocolData {
  position: IPosition
  reserveData: {
    collateral: AaveLikeReserveData
    debt: AaveLikeReserveData
  }
}
