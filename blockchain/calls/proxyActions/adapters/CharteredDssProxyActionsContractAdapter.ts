import { ContractDesc } from '@oasisdex/web3-context'

import { DssProxyActionsCharter } from '../../../../types/web3-v1-contracts/dss-proxy-actions-charter'
import { NonPayableTransactionObject } from '../../../../types/web3-v1-contracts/types'
import { ContextConnected } from '../../../network'
import { ManagerlessProxyActionsContractAdapter } from './ManagerlessProxyActionsAdapter'
import {
  ClaimRewardData,
  ProxyActionsAdapterType,
} from './ProxyActionsSmartContractAdapterInterface'

export class CharteredDssProxyActionsContractAdapter extends ManagerlessProxyActionsContractAdapter<
  DssProxyActionsCharter
> {
  AdapterType = ProxyActionsAdapterType.CHARTER

  resolveContractDesc(context: ContextConnected): ContractDesc {
    return context.dssProxyActionsCharter
  }

  claimRewards(
    _context: ContextConnected,
    _data: ClaimRewardData,
  ): NonPayableTransactionObject<void> {
    throw new Error('chartered (institutional) vaults do not support claiming rewards/bonuses')
  }
}
