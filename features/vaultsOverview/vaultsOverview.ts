import { BigNumber } from 'bignumber.js'
import { VaultWithType } from 'blockchain/vaults'
import { IlkWithBalance } from 'features/ilks/ilksWithBalances'
import { isEqual } from 'lodash'
import { iif, Observable } from 'rxjs'
import { combineLatest, of } from 'rxjs'
import { map } from 'rxjs/internal/operators/map'
import { distinctUntilChanged, switchMap } from 'rxjs/operators'

import { Context } from '../../blockchain/network'
import { getToken } from '../../blockchain/tokensMetadata'
import {
  BorrowPositionVM,
  EarnPositionVM,
  MultiplyPositionVM,
  PositionVM,
} from '../../components/dumb/PositionList'
import { VaultViewMode } from '../../components/VaultTabSwitch'
import {
  formatCryptoBalance,
  formatFiatBalance,
  formatPercent,
} from '../../helpers/formatters/format'
import { calculatePNL } from '../../helpers/multiply/calculations'
import { useFeatureToggle } from '../../helpers/useFeatureToggle'
import { zero } from '../../helpers/zero'
import {
  extractStopLossData,
  StopLossTriggerData,
} from '../automation/protection/common/StopLossTriggerDataExtractor'
import { TriggersData } from '../automation/protection/triggers/AutomationTriggersData'
import { ExchangeAction, ExchangeType, Quote } from '../exchange/exchange'
import { ilksWithFilter$, IlksWithFilters } from '../ilks/ilksFilters'
import { calculateMultiply } from '../multiply/manage/pipes/manageMultiplyVaultCalculations'
import { UserSettingsState } from '../userSettings/userSettings'
import { VaultHistoryEvent } from '../vaultHistory/vaultHistory'
import { vaultsWithFilter$, VaultsWithFilters, VaultWithSLData } from './vaultsFilters'
import { getVaultsSummary, VaultSummary } from './vaultSummary'

export interface VaultsOverview {
  vaults: {
    borrow: VaultsWithFilters
    multiply: VaultsWithFilters
  }
  positions: PositionVM[]
  vaultSummary: VaultSummary | undefined
  ilksWithFilters: IlksWithFilters
}

type VaultWithIlkBalance = VaultWithType &
  IlkWithBalance & { events: VaultHistoryEvent[]; isOwner: boolean }
type VaultPosition = VaultWithIlkBalance & StopLossTriggerData

export function createVaultsOverview$(
  context$: Observable<Context>,
  vaults$: (address: string) => Observable<VaultWithType[]>,
  ilksListWithBalances$: Observable<IlkWithBalance[]>,
  automationTriggersData$: (id: BigNumber) => Observable<TriggersData>,
  vaultHistory$: (vaultId: BigNumber) => Observable<VaultHistoryEvent[]>,
  exchangeQuote$: (
    token: string,
    slippage: BigNumber,
    amount: BigNumber,
    action: ExchangeAction,
    exchangeType: ExchangeType,
  ) => Observable<Quote>,
  userSettings$: Observable<UserSettingsState>,
  address: string,
): Observable<VaultsOverview> {
  const stopLossReadEnabled = useFeatureToggle('StopLossRead')
  const vaultsAddress$ = vaults$(address)

  const vaultsWithHistory$ = vaults$(address).pipe(
    switchMap((vaults) => {
      if (vaults.length === 0) {
        return of([])
      }
      const vaultsWithHistory = vaults.map((vault) =>
        vaultHistory$(vault.id).pipe(map((history) => ({ ...vault, events: history || [] }))),
      )
      return combineLatest(vaultsWithHistory)
    }),
  )
  const vaultsAddressWithIlksBalances$: Observable<VaultWithIlkBalance[]> = combineLatest(
    vaultsWithHistory$,
    ilksListWithBalances$,
    context$,
  ).pipe(
    map(([vaults, balances, context]) => {
      return vaults.map((vault) => {
        const balance = balances.find((balance) => balance.ilk === vault.ilk)

        const isOwner = context.status === 'connected' && context.account === vault.controller

        return {
          ...vault,
          ...balance,
          isOwner,
        }
      })
    }),
    distinctUntilChanged(isEqual),
  )

  const vaultWithAutomationData$: Observable<VaultPosition[]> = vaultsAddressWithIlksBalances$.pipe(
    switchMap((vaults) => {
      return combineLatest(
        (vaults || []).length > 0
          ? vaults.map((vault) => {
              return automationTriggersData$(vault.id).pipe(
                map((automationData) => ({
                  ...vault,
                  ...extractStopLossData(automationData),
                })),
              )
            })
          : of([]),
      )
    }),
  )

  const borrowVaults = (iif(
    () => stopLossReadEnabled,
    vaultWithAutomationData$,
    vaultsAddress$,
  ).pipe(
    map((vaults) => vaults.filter((vault) => vault.type === 'borrow')),
    // TODO casting won't be necessary when Automation feature flag will be removed
  ) as unknown) as Observable<VaultWithSLData>

  const multiplyVaults = (iif(
    () => stopLossReadEnabled,
    vaultWithAutomationData$,
    vaultsAddress$,
  ).pipe(
    map((vaults) => vaults.filter((vault) => vault.type === 'multiply')),
    // TODO casting won't be necessary when Automation feature flag will be removed
  ) as unknown) as Observable<VaultWithSLData>

  return combineLatest(
    vaultsWithFilter$(borrowVaults),
    vaultsWithFilter$(multiplyVaults),
    vaultWithAutomationData$,
    vaultsAddressWithIlksBalances$.pipe(map(getVaultsSummary)),
    ilksWithFilter$(ilksListWithBalances$),
    userSettings$,
  ).pipe(
    switchMap(([borrow, multiply, vaults, vaultSummary, ilksWithFilters, userSettings]) => {
      return mapToPositionVM$(vaults, exchangeQuote$, userSettings).pipe(
        map((positions) => {
          return {
            vaults: {
              borrow,
              multiply,
            },
            positions: positions,
            vaultSummary,
            ilksWithFilters,
          }
        }),
      )
    }),
    distinctUntilChanged(isEqual),
  )
}

function mapToPositionVM$(
  vaults: VaultPosition[],
  exchangeQuote$: (
    token: string,
    slippage: BigNumber,
    amount: BigNumber,
    action: ExchangeAction,
    exchangeType: ExchangeType,
  ) => Observable<Quote>,
  userSettings: UserSettingsState,
): Observable<PositionVM[]> {
  const { borrow, multiply, earn } = vaults.reduce<{
    borrow: VaultPosition[]
    multiply: VaultPosition[]
    earn: VaultPosition[]
  }>(
    (acc, vault) => {
      if (vault.token === 'GUNIV3DAIUSDC1' || vault.token === 'GUNIV3DAIUSDC2') {
        acc.earn.push(vault)
      } else if (vault.type === 'borrow') {
        acc.borrow.push(vault)
      } else if (vault.type === 'multiply') {
        acc.multiply.push(vault)
      }
      return acc
    },
    { borrow: [], multiply: [], earn: [] },
  )

  const borrowVMs: BorrowPositionVM[] = borrow.map((position) => {
    return {
      type: 'borrow' as const,
      isOwnerView: position.isOwner,
      icon: getToken(position.token).iconCircle,
      ilk: position.ilk,
      collateralRatio: formatPercent(position.collateralizationRatio.times(100), { precision: 2 }),
      inDanger: position.atRiskLevelDanger,
      daiDebt: formatCryptoBalance(position.debt),
      collateralLocked: `${formatCryptoBalance(position.lockedCollateral)} ${position.token}`,
      variable: formatPercent(position.stabilityFee.times(100), { precision: 2 }),
      automationEnabled: position.isStopLossEnabled,
      protectionAmount: formatPercent(position.stopLossLevel.times(100)),
      editLinkProps: {
        href: `/${position.id}`,
        hash: VaultViewMode.Overview,
      },
      automationLinkProps: {
        href: `/${position.id}`,
        hash: VaultViewMode.Protection,
      },
      positionId: position.id.toString(),
    }
  })

  const multiplyVMs$: Observable<MultiplyPositionVM[]> = of(multiply).pipe(
    switchMap((positions) => {
      if (positions.length > 0) {
        return combineLatest(
          positions.map((position) => {
            return exchangeQuote$(
              position.token,
              userSettings.slippage,
              position.lockedCollateral,
              'BUY_COLLATERAL',
              'defaultExchange',
            ).pipe(
              map((quote) => {
                const collateralValue =
                  quote.status === 'SUCCESS'
                    ? position.lockedCollateral.times(quote.tokenPrice)
                    : position.lockedCollateralUSD
                return {
                  type: 'multiply' as const,
                  isOwnerView: position.isOwner,
                  icon: getToken(position.token).iconCircle,
                  ilk: position.ilk,
                  positionId: position.id.toString(),
                  multiple: `${calculateMultiply({ ...position }).toFixed(2)}x`,
                  netValue: `$${formatFiatBalance(collateralValue.minus(position.debt))}`,
                  liquidationPrice: `$${formatFiatBalance(position.liquidationPrice)}`,
                  fundingCost: formatPercent(
                    position.debt
                      .div(collateralValue.minus(position.debt))
                      .multipliedBy(position.stabilityFee)
                      .times(100),
                    {
                      precision: 2,
                    },
                  ),
                  automationEnabled: position.isStopLossEnabled,
                  editLinkProps: {
                    href: `/${position.id}`,
                    hash: VaultViewMode.Overview,
                    internalInNewTab: false,
                  },
                  automationLinkProps: {
                    href: `/${position.id}`,
                    hash: VaultViewMode.Protection,
                    internalInNewTab: false,
                  },
                }
              }),
            )
          }),
        )
      } else {
        return of([])
      }
    }),
  )

  const earnVMs$: Observable<EarnPositionVM[]> = of(earn).pipe(
    switchMap((positions) => {
      if (positions.length > 0) {
        return combineLatest(
          positions.map((position) => {
            return exchangeQuote$(
              position.token,
              userSettings.slippage,
              position.lockedCollateral,
              'BUY_COLLATERAL',
              'defaultExchange',
            ).pipe(
              map((quote) => {
                const collateralValue =
                  quote.status === 'SUCCESS'
                    ? position.lockedCollateral.times(quote.tokenPrice)
                    : position.lockedCollateralUSD
                return {
                  type: 'earn' as const,
                  isOwnerView: position.isOwner,
                  icon: getToken(position.token).iconCircle,
                  ilk: position.ilk,
                  positionId: position.id.toString(),
                  netValue: `$${formatFiatBalance(collateralValue.minus(position.debt))}`,
                  sevenDayYield: formatPercent(new BigNumber(0.12).times(100), { precision: 2 }), // TODO: Change in the future
                  pnl: `${formatPercent((getPnl(position) || zero).times(100), {
                    precision: 2,
                    roundMode: BigNumber.ROUND_DOWN,
                  })}`,
                  liquidity: `${formatCryptoBalance(position.ilkDebtAvailable)} DAI`,
                  editLinkProps: {
                    href: `/${position.id}`,
                    hash: VaultViewMode.Overview,
                    internalInNewTab: false,
                  },
                }
              }),
            )
          }),
        )
      } else {
        return of([])
      }
    }),
  )

  return combineLatest(of(borrowVMs), multiplyVMs$, earnVMs$).pipe(
    map(([borrowVMs, multiplyVMs, earnVMs]) => {
      return [...borrowVMs, ...multiplyVMs, ...earnVMs]
    }),
  )
}

function getPnl(vault: VaultWithIlkBalance): BigNumber {
  const { lockedCollateralUSD, debt, events } = vault
  const netValueUSD = lockedCollateralUSD.minus(debt)
  return calculatePNL(events, netValueUSD)
}
