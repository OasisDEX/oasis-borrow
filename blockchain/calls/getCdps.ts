import { CallDef } from 'blockchain/calls/callsHelpers'
import { getNetworkContracts } from 'blockchain/contracts'
import { GetCdps } from 'types/web3-v1-contracts'

export interface GetCdpsArgs {
  proxyAddress: string
  descending: boolean
}

export interface GetCdpsResult {
  ids: string[]
  urns: string[]
  ilks: string[]
}

export const getCdps: CallDef<GetCdpsArgs, GetCdpsResult> = {
  call: ({ descending }, { contract, chainId }) => {
    const getCdps = getNetworkContracts(chainId).getCdps
    return descending
      ? contract<GetCdps>(getCdps).methods.getCdpsDesc
      : contract<GetCdps>(getCdps).methods.getCdpsAsc
  },
  prepareArgs: ({ proxyAddress }, { chainId }) => [
    getNetworkContracts(chainId).dssCdpManager.address,
    proxyAddress,
  ],
}
