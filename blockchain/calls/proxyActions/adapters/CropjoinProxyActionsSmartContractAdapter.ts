import { ContractDesc } from '@oasisdex/web3-context'

import { DssProxyActionsCurve } from '../../../../types/web3-v1-contracts/dss-proxy-actions-curve'
import { ContextConnected } from '../../../network'
import { ManagerlessProxyActionsContractAdapter } from './ManagerlessProxyActionsAdapter'
import { ProxyActionsAdapterType } from './ProxyActionsSmartContractAdapterInterface'

export class CropjoinProxyActionsContractAdapter extends ManagerlessProxyActionsContractAdapter<
  DssProxyActionsCurve
> {
  AdapterType = ProxyActionsAdapterType.CROPJOIN

  resolveContractDesc(context: ContextConnected): ContractDesc {
    return context.dssProxyActionsCurve
  }
}
