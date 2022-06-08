import { BigNumber } from 'bignumber.js'
import { VaultWithType } from 'blockchain/vaults'
import { IlkWithBalance } from 'features/ilks/ilksWithBalances'
import { isEqual } from 'lodash'
import { iif, Observable } from 'rxjs'
import { combineLatest, of } from 'rxjs'
import { map } from 'rxjs/internal/operators/map'
import { distinctUntilChanged, startWith, switchMap } from 'rxjs/operators'

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
import { ilksWithFilter$, IlksWithFilters } from '../ilks/ilksFilters'
import { calculateMultiply } from '../multiply/manage/pipes/manageMultiplyVaultCalculations'
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

type VaultWithIlkBalance = VaultWithType & IlkWithBalance & { events: VaultHistoryEvent[] }
type VaultPosition = VaultWithIlkBalance & StopLossTriggerData

export function createVaultsOverview$(
  vaults$: (address: string) => Observable<VaultWithType[]>,
  ilksListWithBalances$: Observable<IlkWithBalance[]>,
  automationTriggersData$: (id: BigNumber) => Observable<TriggersData>,
  vaultHistory$: (vaultId: BigNumber) => Observable<VaultHistoryEvent[]>,
  address: string,
): Observable<VaultsOverview> {
  const stopLossReadEnabled = useFeatureToggle('StopLossRead')
  const vaultsAddress$ = vaults$(address)

  const vaultsWithHistory$ = vaults$(address).pipe(
    switchMap((vaults) => {
      const vaultsWithHistory = (vaults || []).map((vault) =>
        vaultHistory$(vault.id).pipe(map((history) => ({ ...vault, events: history || [] }))),
      )
      return combineLatest(vaultsWithHistory)
    }),
    startWith<VaultWithType[]>([]),
  )
  const vaultsAddressWithIlksBalances$: Observable<VaultWithIlkBalance[]> = combineLatest(
    vaultsWithHistory$,
    ilksListWithBalances$,
  ).pipe(
    map(([vaults, balances]) => {
      return vaults.map((vault) => {
        const balance = balances.find((balance) => balance.ilk === vault.ilk)

        return {
          ...vault,
          ...balance,
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
  ).pipe(
    map(([borrow, multiply, vaults, vaultSummary, ilksWithFilters]) => ({
      vaults: {
        borrow,
        multiply,
      },
      positions: mapToPositionVM(vaults),
      vaultSummary,
      ilksWithFilters,
    })),
    distinctUntilChanged(isEqual),
  )
}

function mapToPositionVM(vaults: VaultPosition[]): PositionVM[] {
  const { borrow, multiply, earn } = vaults.reduce<{
    borrow: VaultPosition[]
    multiply: VaultPosition[]
    earn: VaultPosition[]
  }>(
    (acc, vault) => {
      if (vault.type === 'borrow') {
        acc.borrow.push(vault)
      } else if (vault.type === 'multiply') {
        if (vault.token === 'GUNIV3DAIUSDC1' || vault.token === 'GUNIV3DAIUSDC2') {
          acc.earn.push(vault)
        } else {
          acc.multiply.push(vault)
        }
      }
      return acc
    },
    { borrow: [], multiply: [], earn: [] },
  )

  const borrowVM: BorrowPositionVM[] = borrow.map((value) => ({
    type: 'borrow' as const,
    icon: getToken(value.token).iconCircle,
    ilk: value.ilk,
    collateralRatio: formatPercent(value.collateralizationRatio, { precision: 2 }),
    inDanger: value.atRiskLevelDanger,
    daiDebt: formatCryptoBalance(value.debt),
    collateralLocked: `${formatCryptoBalance(value.lockedCollateral)} ${value.token}`,
    variable: formatPercent(value.stabilityFee, { precision: 2 }),
    automationEnabled: value.isStopLossEnabled,
    protectionAmount: formatPercent(value.stopLossLevel),
    editLinkProps: {
      href: `/${value.id}`,
      hash: VaultViewMode.Overview,
    },
    automationLinkProps: {
      href: `/${value.id}`,
      hash: VaultViewMode.Protection,
    },
    vaultID: value.id.toString(),
  }))

  const multiplyVM: MultiplyPositionVM[] = multiply.map((value) => ({
    type: 'multiply' as const,
    icon: getToken(value.token).iconCircle,
    ilk: value.ilk,
    vaultID: value.id.toString(),
    multiple: `${calculateMultiply({ ...value }).toFixed(2)}x`,
    netValue: formatCryptoBalance(value.backingCollateralUSD),
    liquidationPrice: `$${formatFiatBalance(value.liquidationPrice)}`,
    fundingCost: formatPercent(calculateFundingCost(value).times(100), { precision: 2 }),
    automationEnabled: value.isStopLossEnabled,
    editLinkProps: {
      href: `/${value.id}`,
      hash: VaultViewMode.Overview,
      internalInNewTab: false,
    },
    automationLinkProps: {
      href: `/${value.id}`,
      hash: VaultViewMode.Protection,
      internalInNewTab: false,
    },
  }))

  const earnVM: EarnPositionVM[] = earn.map((value) => ({
    type: 'earn' as const,
    icon: getToken(value.token).iconCircle,
    ilk: value.ilk,
    vaultID: value.id.toString(),
    netValue: formatCryptoBalance(value.backingCollateralUSD),
    sevenDayYield: formatPercent(new BigNumber(0.12).times(100), { precision: 2 }), // TODO: Change in the future
    pnl: `${formatPercent((getPnl(value) || zero).times(100), {
      precision: 2,
      roundMode: BigNumber.ROUND_DOWN,
    })}`,
    liquidity: `${formatCryptoBalance(value.ilkDebtAvailable)} DAI`,
    editLinkProps: {
      href: `/${value.id}`,
      hash: VaultViewMode.Overview,
      internalInNewTab: false,
    },
  }))

  return [...borrowVM, ...multiplyVM, ...earnVM]
}

function calculateFundingCost(vault: VaultWithIlkBalance): BigNumber {
  return vault.debt.div(vault.backingCollateralUSD).multipliedBy(vault.stabilityFee)
}

function getPnl(vault: VaultWithIlkBalance): BigNumber {
  const { lockedCollateralUSD, debt, events } = vault
  const netValueUSD = lockedCollateralUSD.minus(debt)
  return calculatePNL(events, netValueUSD)
}
