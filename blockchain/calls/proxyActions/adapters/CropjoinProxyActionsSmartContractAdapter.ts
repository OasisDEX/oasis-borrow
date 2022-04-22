import { ContractDesc } from '@oasisdex/web3-context'

import { DssProxyActionsCropjoin } from '../../../../types/web3-v1-contracts'
import { ContextConnected } from '../../../network'
import { ManagerlessProxyActionsContractAdapter } from './ManagerlessProxyActionsAdapter'
import { ProxyActionsAdapterType } from './ProxyActionsSmartContractAdapterInterface'

export class CropjoinProxyActionsContractAdapter extends ManagerlessProxyActionsContractAdapter<DssProxyActionsCropjoin> {
  AdapterType = ProxyActionsAdapterType.CROPJOIN

  resolveContractDesc(context: ContextConnected): ContractDesc {
    return context.dssProxyActionsCropjoin
  }
}
