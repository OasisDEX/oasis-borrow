import { ClaimTxnState } from './bonusPipe'
import { of } from 'rxjs'
import BigNumber from 'bignumber.js'
import { getStateUnpacker } from '../../helpers/testHelpers'
import { expect } from 'chai'
import { createMakerdaoBonusAdapter } from './makerdaoBonusAdapter'
import { mockContextConnected } from '../../helpers/mocks/context.mock'
import { protoTxHelpers } from '../../components/AppContext'
import { vaultActionsLogic } from '../../blockchain/calls/proxyActions/vaultActionsLogic'
import { MockProxyActionsSmartContractAdapter } from '../../blockchain/calls/proxyActions/adapters/mockProxyActionsSmartContractAdapter'
import sinon from 'sinon'
import { TxStatus } from '@oasisdex/transactions'

describe('makerdaoBonusAdapter', () => {
  describe('retrieving bonuses', () => {
    it('pipes the decimals and symbol correctly', () => {
      const makerdaoBonusAdapter = createMakerdaoBonusAdapter(
        () => of({ urnAddress: '0xUrnAddress', ilk: 'ILKYILK-A' }),
        () => of(new BigNumber('34845377488320063721')),
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

      expect(bonusStreamState()?.symbol).eq('CSH')
      expect(bonusStreamState()?.name).eq('token name')
      expect(bonusStreamState()?.amountToClaim.toFixed(0)).eq('35')
      expect(makerdaoBonusAdapter.claimAll).to.exist
    })

    it('returns undefined if the CDP does not support bonuses')
  })

  describe('claiming bonuses', () => {
    it('passes correct args to proxy actions call', () => {
      const txHelpersMock = { ...protoTxHelpers, sendWithGasEstimation: sinon.spy() }

      const mockVaultActions = vaultActionsLogic(MockProxyActionsSmartContractAdapter)
      const makerdaoBonusAdapter = createMakerdaoBonusAdapter(
        () => of({ urnAddress: '0xUrnAddress', ilk: 'ETH-A' }),
        () => of(new BigNumber('34845377488320063721')),
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

      getStateUnpacker(makerdaoBonusAdapter.claimAll!())

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
          sendWithGasEstimation: sinon.stub().returns(of(txStatus)),
        }

        const makerdaoBonusAdapter = createMakerdaoBonusAdapter(
          () => of({ urnAddress: '0xUrnAddress', ilk: 'ETH-A' }),
          () => of(new BigNumber('34845377488320063721')),
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

        const claimRewardState = getStateUnpacker(makerdaoBonusAdapter.claimAll())

        expect(
          claimRewardState(),
          `TxStatus ${txStatus} should map to ClaimTxnState ${claimTxStatus}`,
        ).to.equal(claimTxStatus)
      })
    })
  })
})
