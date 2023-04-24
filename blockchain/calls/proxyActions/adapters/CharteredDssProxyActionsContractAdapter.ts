import { getNetworkContracts } from 'blockchain/contracts'
import { ContextConnected } from 'blockchain/network'
import { ContractDesc } from 'features/web3Context'
import { DssProxyActionsCharter } from 'types/web3-v1-contracts'
import { NonPayableTransactionObject } from 'types/web3-v1-contracts/types'

import { ManagerlessProxyActionsContractAdapter } from './ManagerlessProxyActionsAdapter'
import {
  ClaimRewardData,
  ProxyActionsAdapterType,
} from './ProxyActionsSmartContractAdapterInterface'

export class CharteredDssProxyActionsContractAdapter extends ManagerlessProxyActionsContractAdapter<DssProxyActionsCharter> {
  AdapterType = ProxyActionsAdapterType.CHARTER

  resolveContractDesc(context: ContextConnected): ContractDesc {
    return getNetworkContracts(context.chainId).dssProxyActionsCharter
  }

  claimRewards(
    _context: ContextConnected,
    _data: ClaimRewardData,
  ): NonPayableTransactionObject<void> {
    throw new Error('chartered (institutional) vaults do not support claiming rewards/bonuses')
  }
}
