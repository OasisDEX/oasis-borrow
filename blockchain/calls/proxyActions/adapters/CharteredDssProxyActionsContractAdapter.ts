import { ContractDesc } from '@oasisdex/web3-context'

import { DssProxyActionsCharter } from '../../../../types/web3-v1-contracts/dss-proxy-actions-charter'
import { ContextConnected } from '../../../network'
import { ManagerlessProxyActionsContractAdapter } from './ManagerlessProxyActionsAdapter'

export class CharteredDssProxyActionsContractAdapter extends ManagerlessProxyActionsContractAdapter<
  DssProxyActionsCharter
> {
  resolveContractDesc(context: ContextConnected): ContractDesc {
    return context.dssProxyActionsCharter
  }
}
