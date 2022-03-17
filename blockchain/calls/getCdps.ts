import { GetCdps } from 'types/web3-v1-contracts/get-cdps'

import { CallDef } from '../../blockchain/calls/callsHelpers'

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
  call: ({ descending }, { contract, getCdps }) => {
    return descending
      ? contract<GetCdps>(getCdps).methods.getCdpsDesc
      : contract<GetCdps>(getCdps).methods.getCdpsAsc
  },
  prepareArgs: ({ proxyAddress }, { dssCdpManager }) => [dssCdpManager.address, proxyAddress],
}
