import { getNetworkContracts } from 'blockchain/contracts'
import type { ContextConnected } from 'blockchain/network.types'
import { NetworkIds } from 'blockchain/networks'
import type { ContractDesc } from 'features/web3Context'
import type { DssProxyActionsCharter } from 'types/web3-v1-contracts'
import type { NonPayableTransactionObject } from 'types/web3-v1-contracts/types'

import { ManagerlessProxyActionsContractAdapter } from './ManagerlessProxyActionsAdapter'
import type { ClaimRewardData } from './ProxyActionsSmartContractAdapterInterface'
import { ProxyActionsAdapterType } from './ProxyActionsSmartContractAdapterInterface'

export class CharteredDssProxyActionsContractAdapter extends ManagerlessProxyActionsContractAdapter<DssProxyActionsCharter> {
  AdapterType = ProxyActionsAdapterType.CHARTER

  resolveContractDesc(context: ContextConnected): ContractDesc {
    return getNetworkContracts(NetworkIds.MAINNET, context.chainId).dssProxyActionsCharter
  }

  claimRewards(
    _context: ContextConnected,
    _data: ClaimRewardData,
  ): NonPayableTransactionObject<void> {
    throw new Error('chartered (institutional) vaults do not support claiming rewards/bonuses')
  }
}
