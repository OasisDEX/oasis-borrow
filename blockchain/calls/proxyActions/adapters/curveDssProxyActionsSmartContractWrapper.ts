import { ContractDesc } from '@oasisdex/web3-context'

import { DssProxyActionsCurve } from '../../../../types/web3-v1-contracts/dss-proxy-actions-curve'
import { ContextConnected } from '../../../network'
import { ManagerlessDssProxyActionsContractWrapper } from './managerlessDssProxyActionsAdapter'

export class CurveDssProxyActionsContractWrapper extends ManagerlessDssProxyActionsContractWrapper<
  DssProxyActionsCurve
> {
  resolveContractDesc(context: ContextConnected): ContractDesc {
    return context.dssProxyActionsCurve
  }
}
