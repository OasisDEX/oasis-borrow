import { ContractDesc } from '@oasisdex/web3-context'

import { DssProxyActionsCharter } from '../../../../types/web3-v1-contracts/dss-proxy-actions-charter'
import { ContextConnected } from '../../../network'
import { ManagerlessDssProxyActionsContractWrapper } from './managerlessDssProxyActionsAdapter'

export class CharteredDssProxyActionsContractWrapper extends ManagerlessDssProxyActionsContractWrapper<
  DssProxyActionsCharter
> {
  resolveContractDesc(context: ContextConnected): ContractDesc {
    return context.dssProxyActionsCharter
  }
}
