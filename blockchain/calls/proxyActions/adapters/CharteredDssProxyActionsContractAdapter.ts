import { ContractDesc } from '@oasisdex/web3-context'

import { DssProxyActionsCharter } from '../../../../types/web3-v1-contracts/dss-proxy-actions-charter'
import { ContextConnected } from '../../../network'
import { ManagerlessProxyActionsContractAdapter } from './ManagerlessProxyActionsAdapter'
import { ProxyActionsAdapterType } from './ProxyActionsSmartContractAdapterInterface'

export class CharteredDssProxyActionsContractAdapter extends ManagerlessProxyActionsContractAdapter<
  DssProxyActionsCharter
> {
  AdapterType = ProxyActionsAdapterType.CHARTER

  resolveContractDesc(context: ContextConnected): ContractDesc {
    return context.dssProxyActionsCharter
  }
}
