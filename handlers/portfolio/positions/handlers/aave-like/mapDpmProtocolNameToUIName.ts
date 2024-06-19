import { ProtocolName } from '@summer_fi/summerfi-sdk-common'
import { aaveLikeProtocolNames } from 'handlers/portfolio/positions/handlers/aave-like/helpers'
import type { DpmSubgraphData } from 'handlers/portfolio/positions/helpers/getAllDpmsForWallet'

// map SDK protocol name to the one hardcoded in the UI
export const mapDpmProtocolNameToUIName = (dpm: DpmSubgraphData): DpmSubgraphData => {
  if (dpm.protocol === ProtocolName.AaveV3) {
    return {
      ...dpm,
      protocol: aaveLikeProtocolNames.aavev3,
    }
  }
  return dpm
}
