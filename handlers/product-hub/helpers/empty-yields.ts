import { RiskRatio } from '@oasisdex/dma-library'
import { AaveLikeYieldsResponse, FilterYieldFieldsType } from 'lendingProtocols/aave-like-common'

export const emptyYields = (_risk: RiskRatio, _fields: FilterYieldFieldsType[]) => {
  return Promise.resolve<AaveLikeYieldsResponse>({})
}
