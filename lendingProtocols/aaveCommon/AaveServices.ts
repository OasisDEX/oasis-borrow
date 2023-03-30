import { Observable } from 'rxjs'

import { ProtocolData } from './protocolData'
import { ReserveConfigurationData } from './reserveConfigurationData'
import { ReserveData } from './reserveData'

export interface AaveServices {
  aaveProtocolData$: (
    collateralToken: string,
    debtToken: string,
    proxyAddress: string,
  ) => Observable<ProtocolData>
  aaveReserveConfigurationData$: (args: { token: string }) => Observable<ReserveConfigurationData>
  getAaveReserveData$: (args: { token: string }) => Observable<ReserveData>
}
