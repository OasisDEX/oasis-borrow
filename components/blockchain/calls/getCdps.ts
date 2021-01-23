import { $parseNaturalUnsafe } from 'components/atoms/numeric'
import { Natural } from 'money-ts/lib/Natural'
import { GetCdps } from 'types/web3-v1-contracts/get-cdps'
import { Ilk } from '../ilks'
import { CallDef } from './callsHelpers'

export interface GetCdpsArgs {
  proxyAddress: string
  descending: boolean
}

export interface GetCdpsResult {
  ids: Natural[]
  urns: string[]
  ilks: Ilk[]
}

// TODO better typing in the calldef
export const getCdps: CallDef<GetCdpsArgs, GetCdpsResult> = {
  call: ({ descending }, { contract, getCdps }) => {
    return descending
      ? contract<GetCdps>(getCdps).methods.getCdpsDesc
      : contract<GetCdps>(getCdps).methods.getCdpsAsc
  },
  prepareArgs: ({ proxyAddress }, { dssCdpManager }) => [dssCdpManager.address, proxyAddress],
  postprocess: ({ ids, urns, ilks }: any) => ({
    ids: ids.map((id: string) => $parseNaturalUnsafe(id)),
    urns: urns as string[],
    ilks: ilks as Ilk[],
  }),
}
