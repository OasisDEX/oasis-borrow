import { createBonusPipe$ } from './bonusPipe'
import { of } from 'rxjs'
import BigNumber from 'bignumber.js'
import { getStateUnpacker } from '../../helpers/testHelpers'
import { expect } from 'chai'
import { createMakerdaoBonusAdapter } from './makerdaoBonusAdapter'
import { mockContextConnected } from '../../helpers/mocks/context.mock'
import { protoTxHelpers } from '../../components/AppContext'

describe('makerdaoBonusAdapter', () => {
  it('pipes the decimals and symbol correctly', () => {
    const bonusPipe = createMakerdaoBonusAdapter(
      () => of({ urnAddress: '0xUrnAddress', ilk: 'ILKYILK-A' }),
      () => of(new BigNumber('34845377488320063721')),
      () => of('0xTokenAddress'),
      () => of(new BigNumber(18)),
      () => of('CSH'),
      () => of('token name'),
      of(mockContextConnected),
      of(protoTxHelpers),
      new BigNumber(123),
      new BigNumber(123),
      new BigNumber(123),
    )

    const state = getStateUnpacker(bonusPipe)

    expect(state().bonus?.symbol).eq('CSH')
    expect(state().bonus?.name).eq('token name')
    expect(state().bonus?.amountToClaim.toFixed(0)).eq('35')
    expect(state().claimAll).to.exist
  })
})
