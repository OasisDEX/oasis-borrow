import { TxStatus } from '@oasisdex/transactions'
import BigNumber from 'bignumber.js'
import { expect } from 'chai'
import { NEVER, of } from 'rxjs'
import sinon from 'sinon'

import { MockProxyActionsSmartContractAdapter } from '../../blockchain/calls/proxyActions/adapters/mockProxyActionsSmartContractAdapter'
import { vaultActionsLogic } from '../../blockchain/calls/proxyActions/vaultActionsLogic'
import { createMockVaultResolver$ } from '../../blockchain/calls/vaultResolver'
import { protoTxHelpers } from '../../components/AppContext'
import { mockContextConnected } from '../../helpers/mocks/context.mock'
import { getStateUnpacker } from '../../helpers/testHelpers'
import { ClaimTxnState } from './bonusPipe'
import { createMakerdaoBonusAdapter } from './makerdaoBonusAdapter'

describe('makerdaoBonusAdapter', () => {
  describe('retrieving bonuses', () => {
    it('pipes the decimals and symbol correctly', () => {
      const makerdaoBonusAdapter = createMakerdaoBonusAdapter(
        () => createMockVaultResolver$(),
        () => of(new BigNumber('0')),
        () => of(new BigNumber('34845377488320063721')),
        () => of(new BigNumber('1543374474293051714930707056')),
        () => of('0xTokenAddress'),
        () => of(new BigNumber(18)),
        () => of('CSH'),
        () => of('token name'),
        of(mockContextConnected),
        of(protoTxHelpers),
        vaultActionsLogic(MockProxyActionsSmartContractAdapter),
        () => of('0xProxyAddress'),
        new BigNumber(123),
      )

      const bonusStreamState = getStateUnpacker(makerdaoBonusAdapter.bonus$)
      const claimFuncStreamState = getStateUnpacker(makerdaoBonusAdapter.claimAll$)

      expect(bonusStreamState()?.symbol).eq('CSH')
      expect(bonusStreamState()?.name).eq('token name')
      expect(bonusStreamState()?.amountToClaim.toFixed(0)).eq('54')
      expect(claimFuncStreamState).to.exist
    })

    it('returns undefined if the CDP does not support bonuses')
  })

  describe('claiming bonuses', () => {
    it('passes correct args to proxy actions call when calling stream', () => {
      const txHelpersMock = { ...protoTxHelpers, sendWithGasEstimation: sinon.spy() }

      const mockVaultActions = vaultActionsLogic(MockProxyActionsSmartContractAdapter)
      const makerdaoBonusAdapter = createMakerdaoBonusAdapter(
        () => createMockVaultResolver$(),
        () => of(new BigNumber('0')),
        () => of(new BigNumber('34845377488320063721')),
        () => of(new BigNumber('1543374474293051714930707056')),
        () => of('0xTokenAddress'),
        () => of(new BigNumber(18)),
        () => of('CSH'),
        () => of('token name'),
        of(mockContextConnected),
        of(txHelpersMock),
        mockVaultActions,
        () => of('0xProxyAddress'),
        new BigNumber(123),
      )

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

        const makerdaoBonusAdapter = createMakerdaoBonusAdapter(
          () => createMockVaultResolver$(),
          () => of(new BigNumber('0')),
          () => of(new BigNumber('34845377488320063721')),
          () => of(new BigNumber('1543374474293051714930707056')),
          () => of('0xTokenAddress'),
          () => of(new BigNumber(18)),
          () => of('CSH'),
          () => of('token name'),
          of(mockContextConnected),
          of(txHelpersMock),
          vaultActionsLogic(MockProxyActionsSmartContractAdapter),
          () => of('0xProxyAddress'),
          new BigNumber(123),
        )

        const claimRewardFunc$ = getStateUnpacker(makerdaoBonusAdapter.claimAll$)()
        const claimRewardState = getStateUnpacker(claimRewardFunc$!())

        expect(
          claimRewardState(),
          `TxStatus ${txStatus} should map to ClaimTxnState ${claimTxStatus}`,
        ).to.equal(claimTxStatus)
      })
    })

    it('does not provide claim function if there is no wallet connected', () => {
      const mockVaultActions = vaultActionsLogic(MockProxyActionsSmartContractAdapter)
      const makerdaoBonusAdapter = createMakerdaoBonusAdapter(
        () => createMockVaultResolver$(),
        () => of(new BigNumber('0')),
        () => of(new BigNumber('34845377488320063721')),
        () => of(new BigNumber('1543374474293051714930707056')),
        () => of('0xTokenAddress'),
        () => of(new BigNumber(18)),
        () => of('CSH'),
        () => of('token name'),
        NEVER,
        NEVER, // no txHelpers
        mockVaultActions,
        () => of('0xProxyAddress'),
        new BigNumber(123),
      )

      const claimAllCbState = getStateUnpacker(makerdaoBonusAdapter.claimAll$)()
      expect(claimAllCbState).to.be.undefined
    })

    it('does not provide claim function if the connected wallet is not the same as the vault controller', () => {
      const mockVaultActions = vaultActionsLogic(MockProxyActionsSmartContractAdapter)
      const makerdaoBonusAdapter = createMakerdaoBonusAdapter(
        () => createMockVaultResolver$({ controller: '0xDifferentAddress' }),
        () => of(new BigNumber('0')),
        () => of(new BigNumber('34845377488320063721')),
        () => of(new BigNumber('1543374474293051714930707056')),
        () => of('0xTokenAddress'),
        () => of(new BigNumber(18)),
        () => of('CSH'),
        () => of('token name'),
        of(mockContextConnected),
        of(protoTxHelpers),
        mockVaultActions,
        () => of('0xProxyAddress'),
        new BigNumber(123),
      )

      const claimAllCbState = getStateUnpacker(makerdaoBonusAdapter.claimAll$)()
      expect(claimAllCbState).to.be.undefined
    })
  })
})
