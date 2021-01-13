import { CallDef } from './callsHelpers'
import { McdEnd } from '../../../types/web3-v1-contracts/mcd-end'

export const endLive: CallDef<void, boolean> = {
  call: (_, { contract, mcdEnd }) => contract<McdEnd>(mcdEnd).methods.live,
  prepareArgs: () => [],
  postprocess: (result: any) => result.eq(0)
}

export const endWhen: CallDef<void, Date> = {
  call: (_, { contract, mcdEnd }) => contract<McdEnd>(mcdEnd).methods.when,
  prepareArgs: () => [],
  postprocess: (result: any) => new Date(result.toNumber() * 1000)
}
