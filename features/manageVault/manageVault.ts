import { TxStatus } from '@oasisdex/transactions'
import { BigNumber } from 'bignumber.js'
import { approve, ApproveData, maxUint256 } from 'blockchain/calls/erc20'
import { createDsProxy, CreateDsProxyData } from 'blockchain/calls/proxy'
import {
  depositAndGenerate,
  DepositAndGenerateData,
  withdrawAndPayback,
  WithdrawAndPaybackData,
} from 'blockchain/calls/proxyActions'
import { TxMetaKind } from 'blockchain/calls/txMeta'
import { IlkData } from 'blockchain/ilks'
import { ContextConnected } from 'blockchain/network'
import { Vault } from 'blockchain/vaults'
import { TxHelpers } from 'components/AppContext'
import { UserTokenInfo, userTokenInfoChange$ } from 'features/shared/userTokenInfo'
import { ApplyChange, applyChange, Change, Changes, transactionToX } from 'helpers/form'
import { zero } from 'helpers/zero'
import { curry } from 'lodash'
import { combineLatest, iif, merge, Observable, of, Subject } from 'rxjs'
import {
  distinctUntilChanged,
  filter,
  first,
  map,
  scan,
  shareReplay,
  switchMap,
} from 'rxjs/operators'

const defaultIsStates = {
  isEditingStage: false,
  isProxyStage: false,
  isCollateralAllowanceStage: false,
  isDaiAllowanceStage: false,
  isManageStage: false,
}

function applyIsStageStates(state: ManageVaultState): ManageVaultState {
  const newState = {
    ...state,
    ...defaultIsStates,
  }

  switch (state.stage) {
    case 'editing':
      return {
        ...newState,
        isEditingStage: true,
      }
    case 'proxyWaitingForConfirmation':
    case 'proxyWaitingForApproval':
    case 'proxyInProgress':
    case 'proxyFailure':
    case 'proxySuccess':
      return {
        ...newState,
        isProxyStage: true,
      }
    case 'collateralAllowanceWaitingForConfirmation':
    case 'collateralAllowanceWaitingForApproval':
    case 'collateralAllowanceInProgress':
    case 'collateralAllowanceFailure':
    case 'collateralAllowanceSuccess':
      return {
        ...newState,
        isCollateralAllowanceStage: true,
      }
    case 'daiAllowanceWaitingForConfirmation':
    case 'daiAllowanceWaitingForApproval':
    case 'daiAllowanceInProgress':
    case 'daiAllowanceFailure':
    case 'daiAllowanceSuccess':
      return {
        ...newState,
        isDaiAllowanceStage: true,
      }

    case 'manageWaitingForConfirmation':
    case 'manageWaitingForApproval':
    case 'manageInProgress':
    case 'manageFailure':
    case 'manageSuccess':
      return {
        ...newState,
        isManageStage: true,
      }
    default:
      return state
  }
}

function applyVaultCalculations(state: ManageVaultState): ManageVaultState {
  const {
    collateralBalance,
    depositAmount,
    maxDebtPerUnitCollateral,
    generateAmount,
    currentCollateralPrice,
    liquidationRatio,
    freeCollateral,
    lockedCollateral,
    daiBalance,
    withdrawAmount,
    paybackAmount,
    debt,
  } = state

  const maxDepositAmount = collateralBalance
  const maxDepositAmountUSD = collateralBalance.times(currentCollateralPrice)

  const maxWithdrawAmount = freeCollateral
  const maxWithdrawAmountUSD = freeCollateral.times(currentCollateralPrice)

  const maxGenerateAmount = lockedCollateral
    .plus(depositAmount || zero)
    .times(maxDebtPerUnitCollateral)
    .minus(debt)
  const generateAmountUSD = generateAmount || zero // 1 DAI === 1 USD

  const maxPaybackAmount = daiBalance.lt(debt) ? daiBalance : debt

  const afterLockedCollateral = depositAmount
    ? lockedCollateral.plus(depositAmount)
    : withdrawAmount
    ? lockedCollateral.minus(withdrawAmount)
    : lockedCollateral

  const afterLockedCollateralUSD = afterLockedCollateral.times(currentCollateralPrice)
  const afterDebt = generateAmount
    ? debt.plus(generateAmount)
    : paybackAmount
    ? debt.minus(paybackAmount)
    : debt

  const afterCollateralizationRatio =
    afterLockedCollateralUSD.gt(zero) && afterDebt.gt(zero)
      ? afterLockedCollateralUSD.div(afterDebt)
      : zero

  const afterLiquidationPrice =
    generateAmount && depositAmount && depositAmount.gt(zero)
      ? afterDebt.times(liquidationRatio).div(afterLockedCollateral)
      : zero

  return {
    ...state,
    maxDepositAmount,
    maxGenerateAmount,
    maxWithdrawAmount,
    maxWithdrawAmountUSD,
    afterCollateralizationRatio,
    afterLiquidationPrice,
    generateAmountUSD,
    maxDepositAmountUSD,
    maxPaybackAmount,
  }
}

function validateErrors(state: ManageVaultState): ManageVaultState {
  const {
    depositAmount,
    maxDepositAmount,
    generateAmount,
    debtFloor,
    ilkDebtAvailable,
    afterCollateralizationRatio,
    liquidationRatio,
    paybackAmount,
    withdrawAmount,
    maxWithdrawAmount,
    maxPaybackAmount,
    debt,
    stage,
    collateralAllowanceAmount,
    daiAllowanceAmount,
  } = state

  const errorMessages: ManageVaultErrorMessage[] = []

  if (depositAmount?.gt(maxDepositAmount)) {
    errorMessages.push('depositAmountGreaterThanMaxDepositAmount')
  }

  if (withdrawAmount?.gt(maxWithdrawAmount)) {
    errorMessages.push('withdrawAmountGreaterThanMaxWithdrawAmount')
  }

  if (generateAmount && debt.plus(generateAmount).lt(debtFloor)) {
    errorMessages.push('generateAmountLessThanDebtFloor')
  }

  if (generateAmount?.gt(ilkDebtAvailable)) {
    errorMessages.push('generateAmountGreaterThanDebtCeiling')
  }

  if (paybackAmount?.gt(maxPaybackAmount)) {
    errorMessages.push('paybackAmountGreaterThanMaxPaybackAmount')
  }

  if (
    paybackAmount &&
    debt.minus(paybackAmount).lt(debtFloor) &&
    debt.minus(paybackAmount).gt(zero)
  ) {
    errorMessages.push('paybackAmountLessThanDebtFloor')
  }

  if (
    stage === 'collateralAllowanceWaitingForConfirmation' ||
    stage === 'collateralAllowanceFailure'
  ) {
    if (!collateralAllowanceAmount) {
      errorMessages.push('collateralAllowanceAmountEmpty')
    }
    if (collateralAllowanceAmount?.gt(maxUint256)) {
      errorMessages.push('customCollateralAllowanceAmountGreaterThanMaxUint256')
    }
    if (depositAmount && collateralAllowanceAmount && collateralAllowanceAmount.lt(depositAmount)) {
      errorMessages.push('customCollateralAllowanceAmountLessThanDepositAmount')
    }
  }

  if (stage === 'daiAllowanceWaitingForConfirmation' || stage === 'daiAllowanceFailure') {
    if (!daiAllowanceAmount) {
      errorMessages.push('daiAllowanceAmountEmpty')
    }
    if (daiAllowanceAmount?.gt(maxUint256)) {
      errorMessages.push('customDaiAllowanceAmountGreaterThanMaxUint256')
    }
    if (paybackAmount && daiAllowanceAmount && daiAllowanceAmount.lt(paybackAmount)) {
      errorMessages.push('customDaiAllowanceAmountLessThanPaybackAmount')
    }
  }

  if (generateAmount?.gt(zero) && afterCollateralizationRatio.lt(liquidationRatio)) {
    errorMessages.push('vaultUnderCollateralized')
  }

  return { ...state, errorMessages }
}

function validateWarnings(state: ManageVaultState): ManageVaultState {
  const {
    depositAmount,
    generateAmount,
    withdrawAmount,
    paybackAmount,
    depositAmountUSD,
    debtFloor,
    proxyAddress,
    token,
    debt,
    collateralAllowance,
    daiAllowance,
  } = state

  const warningMessages: ManageVaultWarningMessage[] = []

  if (depositAmountUSD && depositAmount?.gt(zero) && debt.plus(depositAmountUSD).lt(debtFloor)) {
    warningMessages.push('potentialGenerateAmountLessThanDebtFloor')
  }

  if (!proxyAddress) {
    warningMessages.push('noProxyAddress')
  }

  if (!depositAmount) {
    warningMessages.push('depositAmountEmpty')
  }

  if (!generateAmount) {
    warningMessages.push('generateAmountEmpty')
  }

  if (!withdrawAmount) {
    warningMessages.push('withdrawAmountEmpty')
  }

  if (!paybackAmount) {
    warningMessages.push('paybackAmountEmpty')
  }

  if (token !== 'ETH') {
    if (!collateralAllowance) {
      warningMessages.push('noCollateralAllowance')
    }
    if (depositAmount && collateralAllowance && depositAmount.gt(collateralAllowance)) {
      warningMessages.push('collateralAllowanceLessThanDepositAmount')
    }
  }

  if (paybackAmount && daiAllowance && paybackAmount.gt(daiAllowance)) {
    warningMessages.push('daiAllowanceLessThanPaybackAmount')
  }

  return { ...state, warningMessages }
}

type ManageVaultChange = Changes<ManageVaultState>

export type ManualChange =
  | Change<ManageVaultState, 'depositAmount'>
  | Change<ManageVaultState, 'depositAmountUSD'>
  | Change<ManageVaultState, 'withdrawAmount'>
  | Change<ManageVaultState, 'withdrawAmountUSD'>
  | Change<ManageVaultState, 'generateAmount'>
  | Change<ManageVaultState, 'generateAmountUSD'>
  | Change<ManageVaultState, 'paybackAmount'>
  | Change<ManageVaultState, 'collateralAllowanceAmount'>
  | Change<ManageVaultState, 'daiAllowanceAmount'>

const apply: ApplyChange<ManageVaultState> = applyChange

type ManageVaultErrorMessage =
  | 'depositAmountGreaterThanMaxDepositAmount'
  | 'withdrawAmountGreaterThanMaxWithdrawAmount'
  | 'generateAmountLessThanDebtFloor'
  | 'generateAmountGreaterThanDebtCeiling'
  | 'paybackAmountGreaterThanMaxPaybackAmount'
  | 'paybackAmountLessThanDebtFloor'
  | 'vaultUnderCollateralized'
  | 'collateralAllowanceAmountEmpty'
  | 'customCollateralAllowanceAmountGreaterThanMaxUint256'
  | 'customCollateralAllowanceAmountLessThanDepositAmount'
  | 'daiAllowanceAmountEmpty'
  | 'customDaiAllowanceAmountGreaterThanMaxUint256'
  | 'customDaiAllowanceAmountLessThanPaybackAmount'

type ManageVaultWarningMessage =
  | 'potentialGenerateAmountLessThanDebtFloor'
  | 'depositAmountEmpty'
  | 'withdrawAmountEmpty'
  | 'generateAmountEmpty'
  | 'paybackAmountEmpty'
  | 'noProxyAddress'
  | 'noCollateralAllowance'
  | 'noDaiAllowance'
  | 'collateralAllowanceLessThanDepositAmount'
  | 'daiAllowanceLessThanPaybackAmount'

export type ManageVaultStage =
  | 'editing'
  | 'proxyWaitingForConfirmation'
  | 'proxyWaitingForApproval'
  | 'proxyInProgress'
  | 'proxyFailure'
  | 'proxySuccess'
  | 'collateralAllowanceWaitingForConfirmation'
  | 'collateralAllowanceWaitingForApproval'
  | 'collateralAllowanceInProgress'
  | 'collateralAllowanceFailure'
  | 'collateralAllowanceSuccess'
  | 'daiAllowanceWaitingForConfirmation'
  | 'daiAllowanceWaitingForApproval'
  | 'daiAllowanceInProgress'
  | 'daiAllowanceFailure'
  | 'daiAllowanceSuccess'
  | 'manageWaitingForConfirmation'
  | 'manageWaitingForApproval'
  | 'manageInProgress'
  | 'manageFailure'
  | 'manageSuccess'

export type ManageVaultState = UserTokenInfo & {
  stage: ManageVaultStage
  id: BigNumber
  ilk: string
  token: string
  account: string
  accountIsController: boolean

  // validation
  errorMessages: ManageVaultErrorMessage[]
  warningMessages: ManageVaultWarningMessage[]

  // IsStage states
  isEditingStage: boolean
  isProxyStage: boolean
  isCollateralAllowanceStage: boolean
  isDaiAllowanceStage: boolean
  isManageStage: boolean

  // Dynamic Data
  proxyAddress?: string
  progress?: () => void
  reset?: () => void
  change?: (change: ManualChange) => void

  collateralAllowance?: BigNumber
  daiAllowance?: BigNumber

  collateralAllowanceAmount?: BigNumber
  daiAllowanceAmount?: BigNumber

  // deposit
  depositAmount?: BigNumber
  depositAmountUSD?: BigNumber
  maxDepositAmount: BigNumber
  maxDepositAmountUSD: BigNumber

  // withdraw
  withdrawAmount?: BigNumber
  withdrawAmountUSD?: BigNumber
  maxWithdrawAmount: BigNumber
  maxWithdrawAmountUSD: BigNumber

  // generate
  generateAmount?: BigNumber
  generateAmountUSD: BigNumber
  maxGenerateAmount: BigNumber

  // payback
  paybackAmount?: BigNumber
  maxPaybackAmount: BigNumber

  // Ilk information
  maxDebtPerUnitCollateral: BigNumber // Updates
  ilkDebtAvailable: BigNumber // Updates
  debtFloor: BigNumber
  liquidationRatio: BigNumber

  // Vault information
  lockedCollateral: BigNumber
  lockedCollateralPrice: BigNumber
  debt: BigNumber
  liquidationPrice: BigNumber
  collateralizationRatio: BigNumber
  freeCollateral: BigNumber

  // Vault Display Information
  afterLiquidationPrice: BigNumber
  afterCollateralizationRatio: BigNumber

  // ManageInfo
  collateralAllowanceTxHash?: string
  daiAllowanceTxHash?: string
  proxyTxHash?: string
  manageTxHash?: string
  proxyConfirmations?: number
  safeConfirmations: number
  txError?: any
  etherscan?: string
}

function createProxy(
  { sendWithGasEstimation }: TxHelpers,
  proxyAddress$: Observable<string | undefined>,
  change: (ch: ManageVaultChange) => void,
  { safeConfirmations }: ManageVaultState,
) {
  sendWithGasEstimation(createDsProxy, { kind: TxMetaKind.createDsProxy })
    .pipe(
      transactionToX<ManageVaultChange, CreateDsProxyData>(
        { kind: 'stage', stage: 'proxyWaitingForApproval' },
        (txState) =>
          of(
            { kind: 'proxyTxHash', proxyTxHash: (txState as any).txHash as string },
            { kind: 'stage', stage: 'proxyInProgress' },
          ),
        (txState) => {
          return of(
            {
              kind: 'stage',
              stage: 'proxyFailure',
            },
            {
              kind: 'txError',
              txError:
                txState.status === TxStatus.Error || txState.status === TxStatus.CancelledByTheUser
                  ? txState.error
                  : undefined,
            },
          )
        },
        (txState) => {
          return proxyAddress$.pipe(
            filter((proxyAddress) => !!proxyAddress),
            switchMap((proxyAddress) =>
              iif(
                () => (txState as any).confirmations < safeConfirmations,
                of({
                  kind: 'proxyConfirmations',
                  proxyConfirmations: (txState as any).confirmations,
                }),
                of(
                  { kind: 'proxyAddress', proxyAddress: proxyAddress! },
                  {
                    kind: 'stage',
                    stage: 'proxySuccess',
                  },
                ),
              ),
            ),
          )
        },
        safeConfirmations,
      ),
    )
    .subscribe((ch) => change(ch))
}

function setCollateralAllowance(
  { sendWithGasEstimation }: TxHelpers,
  collateralAllowance$: Observable<BigNumber>,
  change: (ch: ManageVaultChange) => void,
  state: ManageVaultState,
) {
  sendWithGasEstimation(approve, {
    kind: TxMetaKind.approve,
    token: state.token,
    spender: state.proxyAddress!,
    amount: state.collateralAllowanceAmount!,
  })
    .pipe(
      transactionToX<ManageVaultChange, ApproveData>(
        { kind: 'stage', stage: 'collateralAllowanceWaitingForApproval' },
        (txState) =>
          of(
            {
              kind: 'collateralAllowanceTxHash',
              collateralAllowanceTxHash: (txState as any).txHash as string,
            },
            { kind: 'stage', stage: 'collateralAllowanceInProgress' },
          ),
        (txState) => {
          return of(
            {
              kind: 'stage',
              stage: 'collateralAllowanceFailure',
            },
            {
              kind: 'txError',
              txError:
                txState.status === TxStatus.Error || txState.status === TxStatus.CancelledByTheUser
                  ? txState.error
                  : undefined,
            },
          )
        },
        () =>
          collateralAllowance$.pipe(
            switchMap((collateralAllowance) =>
              of(
                { kind: 'collateralAllowance', collateralAllowance },
                { kind: 'stage', stage: 'collateralAllowanceSuccess' },
              ),
            ),
          ),
      ),
    )
    .subscribe((ch) => change(ch))
}

function setDaiAllowance(
  { sendWithGasEstimation }: TxHelpers,
  daiAllowance$: Observable<BigNumber>,
  change: (ch: ManageVaultChange) => void,
  state: ManageVaultState,
) {
  sendWithGasEstimation(approve, {
    kind: TxMetaKind.approve,
    token: 'DAI',
    spender: state.proxyAddress!,
    amount: state.daiAllowanceAmount!,
  })
    .pipe(
      transactionToX<ManageVaultChange, ApproveData>(
        { kind: 'stage', stage: 'daiAllowanceWaitingForApproval' },
        (txState) =>
          of(
            {
              kind: 'daiAllowanceTxHash',
              daiAllowanceTxHash: (txState as any).txHash as string,
            },
            { kind: 'stage', stage: 'daiAllowanceInProgress' },
          ),
        (txState) => {
          return of(
            {
              kind: 'stage',
              stage: 'daiAllowanceFailure',
            },
            {
              kind: 'txError',
              txError:
                txState.status === TxStatus.Error || txState.status === TxStatus.CancelledByTheUser
                  ? txState.error
                  : undefined,
            },
          )
        },
        () =>
          daiAllowance$.pipe(
            switchMap((daiAllowance) =>
              of(
                { kind: 'daiAllowance', daiAllowance },
                { kind: 'stage', stage: 'daiAllowanceSuccess' },
              ),
            ),
          ),
      ),
    )
    .subscribe((ch) => change(ch))
}

function manageVaultDepositAndGenerate(
  { send }: TxHelpers,
  change: (ch: ManageVaultChange) => void,
  { generateAmount, depositAmount, proxyAddress, ilk, token, id }: ManageVaultState,
) {
  send(depositAndGenerate, {
    kind: TxMetaKind.depositAndGenerate,
    generateAmount: generateAmount || zero,
    depositAmount: depositAmount || zero,
    proxyAddress: proxyAddress!,
    ilk,
    token,
    id,
  })
    .pipe(
      transactionToX<ManageVaultChange, DepositAndGenerateData>(
        { kind: 'stage', stage: 'manageWaitingForApproval' },
        (txState) =>
          of(
            { kind: 'manageTxHash', manageTxHash: (txState as any).txHash as string },
            { kind: 'stage', stage: 'manageInProgress' },
          ),
        (txState) => {
          return of(
            {
              kind: 'stage',
              stage: 'manageFailure',
            },
            {
              kind: 'txError',
              txError:
                txState.status === TxStatus.Error || txState.status === TxStatus.CancelledByTheUser
                  ? txState.error
                  : undefined,
            },
          )
        },
        () => of({ kind: 'stage', stage: 'manageSuccess' }),
      ),
    )
    .subscribe((ch) => change(ch))
}

function manageVaultWithdrawAndPayback(
  { send }: TxHelpers,
  change: (ch: ManageVaultChange) => void,
  { withdrawAmount, paybackAmount, proxyAddress, ilk, token, id }: ManageVaultState,
) {
  send(withdrawAndPayback, {
    kind: TxMetaKind.withdrawAndPayback,
    withdrawAmount: withdrawAmount || zero,
    paybackAmount: paybackAmount || zero,
    proxyAddress: proxyAddress!,
    ilk,
    token,
    id,
  })
    .pipe(
      transactionToX<ManageVaultChange, WithdrawAndPaybackData>(
        { kind: 'stage', stage: 'manageWaitingForApproval' },
        (txState) =>
          of(
            { kind: 'manageTxHash', manageTxHash: (txState as any).txHash as string },
            { kind: 'stage', stage: 'manageInProgress' },
          ),
        (txState) => {
          return of(
            {
              kind: 'stage',
              stage: 'manageFailure',
            },
            {
              kind: 'txError',
              txError:
                txState.status === TxStatus.Error || txState.status === TxStatus.CancelledByTheUser
                  ? txState.error
                  : undefined,
            },
          )
        },
        () => of({ kind: 'stage', stage: 'manageSuccess' }),
      ),
    )
    .subscribe((ch) => change(ch))
}

function addTransitions(
  txHelpers: TxHelpers,
  proxyAddress$: Observable<string | undefined>,
  collateralAllowance$: Observable<BigNumber>,
  daiAllowance$: Observable<BigNumber>,
  change: (ch: ManageVaultChange) => void,
  state: ManageVaultState,
): ManageVaultState {
  function reset() {
    change({ kind: 'stage', stage: 'editing' })
    change({ kind: 'depositAmount', depositAmount: undefined })
    change({ kind: 'depositAmountUSD', depositAmountUSD: undefined })
    change({ kind: 'withdrawAmount', withdrawAmount: undefined })
    change({ kind: 'withdrawAmountUSD', withdrawAmountUSD: undefined })
    change({ kind: 'generateAmount', generateAmount: undefined })
    change({ kind: 'paybackAmount', paybackAmount: undefined })
    change({ kind: 'collateralAllowanceAmount', collateralAllowanceAmount: maxUint256 })
    change({ kind: 'daiAllowanceAmount', daiAllowanceAmount: maxUint256 })
  }

  function progressEditing() {
    const canProgress = !state.errorMessages.length
    const hasProxy = !!state.proxyAddress

    const isDepositZero = state.depositAmount ? state.depositAmount.eq(zero) : true
    const isPaybackZero = state.paybackAmount ? state.paybackAmount.eq(zero) : true

    const depositAmountLessThanCollateralAllowance =
      state.collateralAllowance &&
      state.depositAmount &&
      state.collateralAllowance.gte(state.depositAmount)

    const paybackAmountLessThanDaiAllowance =
      state.daiAllowance && state.paybackAmount && state.daiAllowance.gte(state.paybackAmount)

    // only needs collateral allowance to deposit
    const hasCollateralAllowance =
      state.token === 'ETH' ? true : depositAmountLessThanCollateralAllowance || isDepositZero

    // only needs collateral allowance to deposit
    const hasDaiAllowance = paybackAmountLessThanDaiAllowance || isPaybackZero

    if (canProgress) {
      if (!hasProxy) {
        change({ kind: 'stage', stage: 'proxyWaitingForConfirmation' })
      } else if (!hasCollateralAllowance) {
        change({ kind: 'stage', stage: 'collateralAllowanceWaitingForConfirmation' })
      } else if (!hasDaiAllowance) {
        change({ kind: 'stage', stage: 'daiAllowanceWaitingForConfirmation' })
      } else change({ kind: 'stage', stage: 'manageWaitingForConfirmation' })
    }
  }

  if (state.stage === 'editing') {
    return {
      ...state,
      change,
      reset,
      progress: progressEditing,
    }
  }

  if (state.stage === 'proxyWaitingForConfirmation' || state.stage === 'proxyFailure') {
    return {
      ...state,
      progress: () => createProxy(txHelpers, proxyAddress$, change, state),
    }
  }

  function progressProxy() {
    const isDepositZero = state.depositAmount ? state.depositAmount.eq(zero) : true
    const isPaybackZero = state.paybackAmount ? state.paybackAmount.eq(zero) : true

    const depositAmountLessThanCollateralAllowance =
      state.collateralAllowance &&
      state.depositAmount &&
      state.collateralAllowance.gte(state.depositAmount)

    const paybackAmountLessThanDaiAllowance =
      state.daiAllowance && state.paybackAmount && state.daiAllowance.gte(state.paybackAmount)

    const hasCollateralAllowance =
      state.token === 'ETH' ? true : depositAmountLessThanCollateralAllowance || isDepositZero

    const hasDaiAllowance = paybackAmountLessThanDaiAllowance || isPaybackZero

    if (!hasCollateralAllowance) {
      change({ kind: 'stage', stage: 'collateralAllowanceWaitingForConfirmation' })
    } else if (!hasDaiAllowance) {
      change({ kind: 'stage', stage: 'daiAllowanceWaitingForConfirmation' })
    } else change({ kind: 'stage', stage: 'editing' })
  }

  if (state.stage === 'proxySuccess') {
    return {
      ...state,
      progress: progressProxy,
      reset: () => change({ kind: 'stage', stage: 'editing' }),
    }
  }

  if (
    state.stage === 'collateralAllowanceWaitingForConfirmation' ||
    state.stage === 'collateralAllowanceFailure'
  ) {
    return {
      ...state,
      change,
      progress: () => setCollateralAllowance(txHelpers, collateralAllowance$, change, state),
      reset: () => change({ kind: 'stage', stage: 'editing' }),
    }
  }

  function progressCollateralAllowance() {
    const isPaybackZero = state.paybackAmount ? state.paybackAmount.eq(zero) : true

    const paybackAmountLessThanDaiAllowance =
      state.daiAllowance && state.paybackAmount && state.daiAllowance.gte(state.paybackAmount)

    const hasDaiAllowance = paybackAmountLessThanDaiAllowance || isPaybackZero

    if (!hasDaiAllowance) {
      change({ kind: 'stage', stage: 'daiAllowanceWaitingForConfirmation' })
    } else change({ kind: 'stage', stage: 'editing' })
  }

  if (state.stage === 'collateralAllowanceSuccess') {
    return {
      ...state,
      progress: progressCollateralAllowance,
    }
  }

  if (
    state.stage === 'daiAllowanceWaitingForConfirmation' ||
    state.stage === 'daiAllowanceFailure'
  ) {
    return {
      ...state,
      change,
      progress: () => setDaiAllowance(txHelpers, daiAllowance$, change, state),
      reset: () => change({ kind: 'stage', stage: 'editing' }),
    }
  }

  if (state.stage === 'daiAllowanceSuccess') {
    return {
      ...state,
      progress: () =>
        change({
          kind: 'stage',
          stage: 'editing',
        }),
    }
  }

  function progressManage() {
    const isDepositAndGenerate = state.depositAmount || state.generateAmount

    if (isDepositAndGenerate) {
      return manageVaultDepositAndGenerate(txHelpers, change, state)
    } else {
      return manageVaultWithdrawAndPayback(txHelpers, change, state)
    }
  }

  if (state.stage === 'manageWaitingForConfirmation' || state.stage === 'manageFailure') {
    return {
      ...state,
      progress: progressManage,
      reset: () => change({ kind: 'stage', stage: 'editing' }),
    }
  }

  if (state.stage === 'manageSuccess') {
    return {
      ...state,
      progress: () => {
        reset()
        change({
          kind: 'stage',
          stage: 'editing',
        })
      },
    }
  }

  return state
}

function vaultChange$<T extends keyof Vault>(vaultData$: Observable<Vault>, kind: T) {
  return vaultData$.pipe(
    map((vault) => ({
      kind,
      [kind]: vault[kind],
    })),
  )
}

function ilkDataChange$<T extends keyof IlkData>(ilkData$: Observable<IlkData>, kind: T) {
  return ilkData$.pipe(
    map((ilkData) => ({
      kind,
      [kind]: ilkData[kind],
    })),
  )
}

export function createManageVault$(
  context$: Observable<ContextConnected>,
  txHelpers$: Observable<TxHelpers>,
  proxyAddress$: (address: string) => Observable<string | undefined>,
  allowance$: (token: string, owner: string, spender: string) => Observable<BigNumber>,
  userTokenInfo$: (token: string, account: string) => Observable<UserTokenInfo>,
  ilkData$: (ilk: string) => Observable<IlkData>,
  vault$: (id: BigNumber) => Observable<Vault>,
  id: BigNumber,
): Observable<ManageVaultState> {
  return combineLatest(context$, txHelpers$).pipe(
    switchMap(([context, txHelpers]) => {
      const account = context.account
      return vault$(id).pipe(
        first(),
        switchMap(
          ({
            token,
            ilk,
            lockedCollateral,
            lockedCollateralPrice,
            debt,
            collateralizationRatio,
            liquidationPrice,
            freeCollateral,
            controller,
          }) => {
            return combineLatest(
              userTokenInfo$(token, account),
              ilkData$(ilk),
              proxyAddress$(account),
            ).pipe(
              first(),
              switchMap(
                ([
                  userTokenInfo,
                  { maxDebtPerUnitCollateral, ilkDebtAvailable, debtFloor, liquidationRatio },
                  proxyAddress,
                ]) => {
                  const collateralAllowance$ =
                    (proxyAddress && allowance$(token, account, proxyAddress)) || of(undefined)
                  const daiAllowance$ =
                    (proxyAddress && allowance$('DAI', account, proxyAddress)) || of(undefined)

                  return combineLatest(collateralAllowance$, daiAllowance$).pipe(
                    first(),
                    switchMap(([collateralAllowance, daiAllowance]) => {
                      const initialState: ManageVaultState = {
                        ...defaultIsStates,
                        ...userTokenInfo,
                        stage: 'editing',
                        token,
                        id,
                        account,
                        accountIsController: account === controller,
                        errorMessages: [],
                        warningMessages: [],

                        depositAmount: undefined,
                        depositAmountUSD: undefined,
                        maxDepositAmount: zero,
                        maxDepositAmountUSD: zero,

                        withdrawAmount: undefined,
                        withdrawAmountUSD: undefined,
                        maxWithdrawAmount: zero,
                        maxWithdrawAmountUSD: zero,

                        generateAmount: undefined,
                        generateAmountUSD: zero,
                        maxGenerateAmount: zero,

                        paybackAmount: undefined,
                        maxPaybackAmount: zero,

                        lockedCollateral,
                        lockedCollateralPrice,
                        debt,
                        liquidationPrice,
                        collateralizationRatio,
                        freeCollateral,

                        afterLiquidationPrice: zero,
                        afterCollateralizationRatio: zero,
                        ilk,
                        maxDebtPerUnitCollateral,
                        ilkDebtAvailable,
                        debtFloor,
                        liquidationRatio,
                        proxyAddress,
                        safeConfirmations: context.safeConfirmations,
                        etherscan: context.etherscan.url,

                        collateralAllowance,
                        daiAllowance,
                        collateralAllowanceAmount: maxUint256,
                        daiAllowanceAmount: maxUint256,
                      }

                      const change$ = new Subject<ManageVaultChange>()

                      function change(ch: ManageVaultChange) {
                        change$.next(ch)
                      }

                      const environmentChanges$ = merge(
                        userTokenInfoChange$(userTokenInfo$(token, account), 'collateralBalance'),
                        userTokenInfoChange$(userTokenInfo$(token, account), 'ethBalance'),
                        userTokenInfoChange$(userTokenInfo$(token, account), 'daiBalance'),
                        userTokenInfoChange$(
                          userTokenInfo$(token, account),
                          'currentCollateralPrice',
                        ),
                        userTokenInfoChange$(userTokenInfo$(token, account), 'currentEthPrice'),
                        userTokenInfoChange$(userTokenInfo$(token, account), 'nextCollateralPrice'),
                        userTokenInfoChange$(userTokenInfo$(token, account), 'nextEthPrice'),
                        userTokenInfoChange$(
                          userTokenInfo$(token, account),
                          'dateLastCollateralPrice',
                        ),
                        userTokenInfoChange$(
                          userTokenInfo$(token, account),
                          'dateNextCollateralPrice',
                        ),
                        userTokenInfoChange$(userTokenInfo$(token, account), 'dateLastEthPrice'),
                        userTokenInfoChange$(userTokenInfo$(token, account), 'dateNextEthPrice'),
                        userTokenInfoChange$(
                          userTokenInfo$(token, account),
                          'isStaticCollateralPrice',
                        ),
                        userTokenInfoChange$(userTokenInfo$(token, account), 'isStaticEthPrice'),

                        ilkDataChange$(ilkData$(ilk), 'maxDebtPerUnitCollateral'),
                        ilkDataChange$(ilkData$(ilk), 'ilkDebtAvailable'),
                        ilkDataChange$(ilkData$(ilk), 'debtFloor'),

                        vaultChange$(vault$(id), 'lockedCollateral'),
                        vaultChange$(vault$(id), 'debt'),
                        vaultChange$(vault$(id), 'collateralizationRatio'),
                        vaultChange$(vault$(id), 'liquidationPrice'),
                        vaultChange$(vault$(id), 'lockedCollateralPrice'),
                        vaultChange$(vault$(id), 'freeCollateral'),
                      )

                      const connectedProxyAddress$ = proxyAddress$(account)

                      const connectedCollateralAllowance$ = connectedProxyAddress$.pipe(
                        switchMap((proxyAddress) =>
                          proxyAddress ? allowance$(token, account, proxyAddress) : of(zero),
                        ),
                        distinctUntilChanged((x, y) => x.eq(y)),
                      )

                      const connectedDaiAllowance$ = connectedProxyAddress$.pipe(
                        switchMap((proxyAddress) =>
                          proxyAddress ? allowance$('DAI', account, proxyAddress) : of(zero),
                        ),
                        distinctUntilChanged((x, y) => x.eq(y)),
                      )

                      return merge(change$, environmentChanges$).pipe(
                        scan(apply, initialState),
                        map(applyVaultCalculations),
                        map(validateErrors),
                        map(validateWarnings),
                        map(
                          curry(addTransitions)(
                            txHelpers,
                            connectedProxyAddress$,
                            connectedCollateralAllowance$,
                            connectedDaiAllowance$,
                            change,
                          ),
                        ),
                        shareReplay(1),
                      )
                    }),
                  )
                },
              ),
            )
          },
        ),
      )
    }),
    map(applyIsStageStates),
  )
}
