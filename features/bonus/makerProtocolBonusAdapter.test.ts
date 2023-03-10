import { TxStatus } from '@oasisdex/transactions'
import BigNumber from 'bignumber.js'
import { expect } from 'chai'
import { NEVER, Observable, of } from 'rxjs'
import sinon from 'sinon'

import { MockProxyActionsSmartContractAdapter } from '../../blockchain/calls/proxyActions/adapters/mockProxyActionsSmartContractAdapter'
import {
  vaultActionsLogic,
  VaultActionsLogicInterface,
} from '../../blockchain/calls/proxyActions/vaultActionsLogic'
import { VaultResolve } from '../../blockchain/calls/vaultResolver'
import { createMockVaultResolver$ } from '../../blockchain/calls/vaultResolver.mock'
import { ContextConnected } from '../../blockchain/network'
import { protoTxHelpers, TxHelpers } from '../../components/AppContext'
import { mockContextConnected } from '../../helpers/mocks/context.mock'
import { getStateUnpacker } from '../../helpers/testHelpers'
import { ClaimTxnState } from './bonusPipe'
import { createMakerProtocolBonusAdapter } from './makerProtocolBonusAdapter'

function constructMakerProtocolBonusAdapterForTests({
  customVaultActionsLogicImp,
  customTxHelpersImp,
  customContextConnectedImp,
  customVaultResolverImp,
}: {
  customVaultActionsLogicImp?: VaultActionsLogicInterface
  customTxHelpersImp?: Observable<TxHelpers>
  customContextConnectedImp?: Observable<ContextConnected>
  customVaultResolverImp?: () => Observable<VaultResolve>
} = {}) {
  const _vaultActionsLogic =
    customVaultActionsLogicImp || vaultActionsLogic(MockProxyActionsSmartContractAdapter)
  const _txHelpers = customTxHelpersImp || of(protoTxHelpers)
  const _contextConnected = customContextConnectedImp || of(mockContextConnected)
  const _vaultResolver = customVaultResolverImp || createMockVaultResolver$
  return createMakerProtocolBonusAdapter(
    () => _vaultResolver(),
    () => of(new BigNumber('213546478530833333208')),
    {
      stake$: () => of(new BigNumber('884164304490031118333')),
      share$: () => of(new BigNumber('1991795778107046866929307986')),
      bonusTokenAddress$: () => of('0xTokenAddress'),
      stock$: () => of(new BigNumber('1907391335880109885123')),
      total$: () => of(new BigNumber('1907391335880109885123')),
      crops$: () => of(new BigNumber('921300255712382934088')),
    },
    {
      tokenDecimals$: () => of(new BigNumber(18)),
      tokenSymbol$: () => of('CSH'),
      tokenName$: () => of('token name'),
      tokenBalanceRawForJoin$: () => of(new BigNumber('1907391335880109885123')),
    },
    _contextConnected,
    _txHelpers,
    _vaultActionsLogic,
    () => of('0xProxyAddress'),
    new BigNumber(123),
  )
}

describe('makerProtocolBonusAdapter', () => {
  describe('retrieving bonuses', () => {
    it('pipes the decimals and symbol correctly', () => {
      const makerdaoBonusAdapter = constructMakerProtocolBonusAdapterForTests()

      const bonusStreamState = getStateUnpacker(makerdaoBonusAdapter.bonus$)
      const claimFuncStreamState = getStateUnpacker(makerdaoBonusAdapter.claimAll$)

      expect(bonusStreamState()?.symbol).eq('CSH')
      expect(bonusStreamState()?.name).eq('token name')
      // 938.763165226365499211
      expect(bonusStreamState()?.amountToClaim.toFixed(4)).eq('938.7632')
      expect(claimFuncStreamState).to.exist
      expect(bonusStreamState()?.readableAmount).to.eq('939CSH')
    })
  })

  describe('claiming bonuses', () => {
    it('passes correct args to proxy actions call when calling stream', () => {
      const txHelpersMock = { ...protoTxHelpers, sendWithGasEstimation: sinon.spy() }

      const mockVaultActions = vaultActionsLogic(MockProxyActionsSmartContractAdapter)

      const makerdaoBonusAdapter = constructMakerProtocolBonusAdapterForTests({
        customVaultActionsLogicImp: mockVaultActions,
        customTxHelpersImp: of(txHelpersMock),
      })

      const claimAllCbState = getStateUnpacker(makerdaoBonusAdapter.claimAll$)()
      getStateUnpacker(claimAllCbState!())

      expect(txHelpersMock.sendWithGasEstimation).to.have.been.calledWith(
        sinon.match(mockVaultActions.claimReward),
        sinon.match({
          cdpId: new BigNumber(123),
          gemJoinAddress: '0x775787933e92b709f2a3C70aa87999696e74A9F8',
          kind: 'claimReward',
          proxyAddress: '0xProxyAddress',
        }),
      )
    })

    it('maps the claim status correctly', () => {
      const testCases = [
        {
          txStatus: TxStatus.CancelledByTheUser,
          claimTxStatus: ClaimTxnState.FAILED,
        },
        {
          txStatus: TxStatus.Failure,
          claimTxStatus: ClaimTxnState.FAILED,
        },
        {
          txStatus: TxStatus.Error,
          claimTxStatus: ClaimTxnState.FAILED,
        },
        {
          txStatus: TxStatus.Propagating,
          claimTxStatus: ClaimTxnState.PENDING,
        },
        {
          txStatus: TxStatus.WaitingForConfirmation,
          claimTxStatus: ClaimTxnState.PENDING,
        },
        {
          txStatus: TxStatus.WaitingForApproval,
          claimTxStatus: ClaimTxnState.PENDING,
        },
        {
          txStatus: undefined,
          claimTxStatus: ClaimTxnState.PENDING,
        },
        {
          txStatus: TxStatus.Success,
          claimTxStatus: ClaimTxnState.SUCCEEDED,
        },
      ]

      testCases.forEach(({ txStatus, claimTxStatus }) => {
        const txHelpersMock = {
          ...protoTxHelpers,
          sendWithGasEstimation: sinon.stub().returns(of({ status: txStatus })),
        }

        const makerdaoBonusAdapter = constructMakerProtocolBonusAdapterForTests({
          customTxHelpersImp: of(txHelpersMock),
        })

        const claimRewardFunc$ = getStateUnpacker(makerdaoBonusAdapter.claimAll$)()
        const claimRewardState = getStateUnpacker(claimRewardFunc$!())

        expect(
          claimRewardState(),
          `TxStatus ${txStatus} should map to ClaimTxnState ${claimTxStatus}`,
        ).to.equal(claimTxStatus)
      })
    })

    it('does not provide claim function if there is no wallet connected', () => {
      const makerdaoBonusAdapter = constructMakerProtocolBonusAdapterForTests({
        customContextConnectedImp: NEVER,
        customTxHelpersImp: NEVER,
      })

      const claimAllCbState = getStateUnpacker(makerdaoBonusAdapter.claimAll$)()
      expect(claimAllCbState).to.be.undefined
    })

    it('does not provide claim function if the connected wallet is not the same as the vault controller', () => {
      const makerdaoBonusAdapter = constructMakerProtocolBonusAdapterForTests({
        customVaultResolverImp: () =>
          createMockVaultResolver$({ controller: '0xDifferentAddress' }),
      })

      const claimAllCbState = getStateUnpacker(makerdaoBonusAdapter.claimAll$)()
      expect(claimAllCbState).to.be.undefined
    })
  })
})
