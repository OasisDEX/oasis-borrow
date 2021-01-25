import Web3 from 'web3'
import { McdSpot } from '../../../types/web3-v1-contracts/mcd-spot'
import {
  $createCollateralDebtPriceRatio,
  $createDebtPrice,
  CollateralDebtPriceRatio,
  DebtPrice,
  Ilk,
} from '../ilks'
import { CallDef } from './callsHelpers'

export interface SpotIlk<I extends Ilk> {
  ilk: I
  priceFeedAddress: string
  liquidationRatio: CollateralDebtPriceRatio<I>
}

export const spotIlks: CallDef<Ilk, SpotIlk<Ilk>> = {
  call: (_, { contract, mcdSpot }) => contract<McdSpot>(mcdSpot).methods.ilks,
  prepareArgs: (ilk) => [Web3.utils.utf8ToHex(ilk)],
  postprocess: ({ pip, mat }: any, ilk) => ({
    ilk,
    priceFeedAddress: pip,
    liquidationRatio: $createCollateralDebtPriceRatio(ilk, mat),
  }),
}

export const spotPar: CallDef<void, DebtPrice> = {
  call: (_, { contract, mcdSpot }) => contract<McdSpot>(mcdSpot).methods.par,
  prepareArgs: () => [],
  postprocess: (par: any) => $createDebtPrice(par),
}
