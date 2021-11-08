import { BigNumber } from 'bignumber.js'
import { createIlkDataChange$, IlkData } from 'blockchain/ilks'
import { ContextConnected } from 'blockchain/network'
import { getToken } from 'blockchain/tokensMetadata'
import { AddGasEstimationFunction, TxHelpers } from 'components/AppContext'
import { ExchangeAction, Quote } from 'features/exchange/exchange'

import { DssGuniProxyActions } from 'types/ethers-contracts/DssGuniProxyActions'

import { BalanceInfo, balanceInfoChange$ } from 'features/shared/balanceInfo'
import { PriceInfo, priceInfoChange$ } from 'features/shared/priceInfo'
import { GasEstimationStatus } from 'helpers/form'
import { combineLatest, iif, merge, Observable, of, Subject, throwError } from 'rxjs'
import { first, map, scan, shareReplay, switchMap, tap } from 'rxjs/internal/operators'
import {
  FormChanges,
  FormFunctions,
  FormState,
  applyFormChange,
  addFormTransitions,
  defaultFormState,
  EditingStage,
  applyIsEditingStage,
} from './guniForm'
import { EnvironmentState, EnvironmentChange, applyEnvironment } from './enviroment'
import {
  addProxyTransitions,
  applyIsProxyStage,
  applyProxyChanges,
  defaultProxyStage,
  ProxyChanges,
  ProxyStages,
  ProxyState,
} from 'features/proxy/proxy'
import {
  applyAllowanceChanges,
  AllowanceChanges,
  AllowanceState,
  AllowanceFunctions,
  defaultAllowanceState,
  allowanceTransitions,
  applyIsAllowanceStage,
  AllowanceStages,
  applyAllowanceConditions,
} from 'features/allowance/allowance'
import { combineTransitions } from '../../helpers/pipelines/combineTransitions'
import { combineApplyChanges } from '../../helpers/pipelines/combineApply'

import { TxStage } from 'features/openMultiplyVault/openMultiplyVault' // TODO: remove
import { one, zero } from 'helpers/zero'
import { CallDef, TransactionDef } from 'blockchain/calls/callsHelpers'
import { amountToWei } from 'blockchain/utils'

type InjectChange = { kind: 'injectStateOverride'; stateToOverride: OpenGuniVaultState }

interface OverrideHelper {
  injectStateOverride: (state: Partial<any>) => void
}

export type Stage = EditingStage | ProxyStages | AllowanceStages | TxStage

interface StageState {
  stage: Stage
}

interface VaultTxInfo {
  txError?: any
  etherscan?: string
  safeConfirmations: number
}

interface StageFunctions {
  progress?: () => void
  regress?: () => void
  clear: () => void
}

interface ExchangeState {
  quote?: Quote
  swap?: Quote
  exchangeError: boolean
  slippage: BigNumber
}

type ExchangeChange = { kind: 'quote'; quote: Quote } | { kind: 'swap'; swap: Quote }

function createInitialQuoteChange(
  exchangeQuote$: (
    token: string,
    slippage: BigNumber,
    amount: BigNumber,
    action: ExchangeAction,
  ) => Observable<Quote>,
  token: string,
): Observable<ExchangeChange> {
  return exchangeQuote$(token, new BigNumber(0.1), new BigNumber(1), 'BUY_COLLATERAL').pipe(
    map((quote) => ({ kind: 'quote' as const, quote })),
    shareReplay(1),
  )
}

function applyExchange<S extends ExchangeState>(state: S, change: ExchangeChange): S {
  switch (change.kind) {
    case 'quote':
      return { ...state, quote: change.quote }
    case 'swap':
      return { ...state, swap: change.swap }
    default:
      return state
  }
}

type OpenGuniChanges =
  | EnvironmentChange
  | FormChanges
  | InjectChange
  | ProxyChanges
  | AllowanceChanges

type ErrorState = {
  errorMessages: string[] // TODO add errors
}

type WarringState = {
  warningMessages: string[] // TODO add warring
}

type OpenGuniVaultState = OverrideHelper &
  StageState &
  StageFunctions &
  AllowanceState &
  AllowanceFunctions &
  FormFunctions &
  FormState &
  EnvironmentState &
  ExchangeState &
  VaultTxInfo &
  ErrorState &
  WarringState &
  ProxyState &
  GuniCalculations

const apply = combineApplyChanges<OpenGuniVaultState, OpenGuniChanges>(
  applyEnvironment,
  applyFormChange,
  applyProxyChanges,
  applyAllowanceChanges,
  applyExchange,
)

interface GuniCalculations {
  leveragedAmount?: BigNumber
  flAmount?: BigNumber
  maxMultiply?: BigNumber
}

function applyCalculations<S extends { ilkData: IlkData; depositAmount?: BigNumber }>(state: S): S {
  // TODO: missing fees
  const maxMultiply = state.ilkData.liquidationRatio.minus(one)
  const leveragedAmount = state.depositAmount ? state.depositAmount.div(maxMultiply) : zero
  const flAmount = state.depositAmount ? leveragedAmount.minus(state.depositAmount) : zero

  return {
    ...state,
    maxMultiply,
    leveragedAmount,
    flAmount,
  }
}

export const getToken2Balance: CallDef<{ token: string; leveragedAmount: BigNumber }, BigNumber> = {
  call: (_, { contract, dssGuniProxyActions }) => {
    return contract<DssGuniProxyActions>(dssGuniProxyActions).methods.getOtherTokenAmount
  },
  prepareArgs: ({ token, leveragedAmount }, context) => {
    // const tokenAddress = '0xAbDDAfB225e10B90D798bB8A886238Fb835e2053'
    const tokenAddress = context.tokens[token]

    if (tokenAddress !== tokenAddress) throw new Error('tokenAddress is not defined') // TODO temporary

    return [tokenAddress, context.guniResolver, amountToWei(leveragedAmount, 'DAI').toFixed(0), 6] // TODO: remove fixed precision
  },
  postprocess: (token2Amount: any) => new BigNumber(token2Amount).div(new BigNumber(10).pow(6)),
}

export function createOpenGuniVault$(
  context$: Observable<ContextConnected>,
  txHelpers$: Observable<TxHelpers>,
  proxyAddress$: (address: string) => Observable<string | undefined>,
  allowance$: (token: string, owner: string, spender: string) => Observable<BigNumber>,
  priceInfo$: (token: string) => Observable<PriceInfo>,
  balanceInfo$: (token: string, address: string | undefined) => Observable<BalanceInfo>,
  ilks$: Observable<string[]>,
  ilkData$: (ilk: string) => Observable<IlkData>,
  exchangeQuote$: (
    token: string,
    slippage: BigNumber,
    amount: BigNumber,
    action: ExchangeAction,
  ) => Observable<Quote>,
  //   addGasEstimation$: AddGasEstimationFunction,
  ilk: string,
): Observable<OpenGuniVaultState> {
  return ilks$.pipe(
    switchMap((ilks) =>
      iif(
        () => !ilks.some((i) => i === ilk),
        throwError(new Error(`Ilk ${ilk} does not exist`)),
        combineLatest(context$, txHelpers$, ilkData$(ilk)).pipe(
          first(),
          switchMap(([context, txHelpers, ilkData]) => {
            const { token } = ilkData
            const tokenInfo = getToken(token)

            if (!tokenInfo.token1 || !tokenInfo.token2) {
              throw new Error('Missing tokens in configuration')
            }

            const account = context.account
            return combineLatest(
              priceInfo$(token),
              balanceInfo$(tokenInfo.token1, account),
              proxyAddress$(account),
            ).pipe(
              first(),
              switchMap(([priceInfo, balanceInfo, proxyAddress]) =>
                (
                  (proxyAddress &&
                    tokenInfo.token1 &&
                    allowance$(tokenInfo.token1, account, proxyAddress)) ||
                  of(undefined)
                ).pipe(
                  first(),
                  switchMap((allowance) => {
                    const change$ = new Subject<OpenGuniChanges>()

                    function change(ch: OpenGuniChanges) {
                      change$.next(ch)
                    }

                    // NOTE: Not to be used in production/dev, test only
                    function injectStateOverride(stateToOverride: Partial<OpenGuniVaultState>) {
                      return change$.next({ kind: 'injectStateOverride', stateToOverride })
                    }

                    // const totalSteps = calculateInitialTotalSteps(proxyAddress, token, allowance)
                    const SLIPPAGE = new BigNumber(0.1)

                    const initialState: OpenGuniVaultState = {
                      ...defaultFormState,
                      ...defaultAllowanceState,
                      ...defaultProxyStage,
                      stage: 'editing',
                      priceInfo,
                      balanceInfo,
                      ilkData,
                      token,
                      account,
                      ilk,
                      proxyAddress,
                      allowance,
                      safeConfirmations: context.safeConfirmations,
                      etherscan: context.etherscan.url,
                      errorMessages: [],
                      warningMessages: [],
                      exchangeError: false,
                      //   summary: defaultOpenVaultSummary,
                      slippage: SLIPPAGE,

                      // totalSteps,
                      // currentStep: 1,
                      // exchangeError: false,
                      clear: () => change({ kind: 'clear' }),
                      // gasEstimationStatus: GasEstimationStatus.unset,
                      injectStateOverride,
                    }

                    const stateSubject$ = new Subject<OpenGuniVaultState>()

                    const environmentChanges$ = merge(
                      priceInfoChange$(priceInfo$, token),
                      balanceInfoChange$(balanceInfo$, token, account),
                      createIlkDataChange$(ilkData$, ilk),
                      createInitialQuoteChange(exchangeQuote$, tokenInfo.token2),

                      //   createExchangeChange$(exchangeQuote$, stateSubject$),
                    )

                    const connectedProxyAddress$ = proxyAddress$(account)

                    const applyTransition = combineTransitions<OpenGuniVaultState>( // TODO: can we do it better?
                      (state) => addFormTransitions(change, state),
                      (state) =>
                        addProxyTransitions(txHelpers, connectedProxyAddress$, change, state),
                      (state) =>
                        allowanceTransitions(
                          txHelpers,
                          change,
                          { tokenToAllow: tokenInfo.token1 },
                          state,
                        ),
                    )

                    const applyStages = combineTransitions<OpenGuniVaultState>(
                      applyIsEditingStage,
                      applyIsProxyStage,
                      applyIsAllowanceStage,
                      applyAllowanceConditions,
                      applyCalculations,
                    )

                    return merge(change$, environmentChanges$).pipe(
                      scan(apply, initialState),
                      map(applyStages),
                      switchMap((state) => {
                        return of(state)
                      }),
                      //   map(validateErrors),
                      //   map(validateWarnings),
                      //   switchMap(curry(applyEstimateGas)(addGasEstimation$)),
                      //   map(
                      //     curry(addTransitions)(txHelpers, context, connectedProxyAddress$, change),
                      //   ),
                      map(applyTransition),
                      tap((state) => stateSubject$.next(state)),
                    )
                  }),
                ),
              ),
            )
          }),
        ),
      ),
    ),
    shareReplay(1),
  )
}
