import { BigNumber } from 'bignumber.js'
import { VaultViewMode } from 'components/vault/GeneralManageTabBar'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'

import { getToken } from '../../blockchain/tokensMetadata'
import {
  BorrowPositionVM,
  EarnPositionVM,
  MultiplyPositionVM,
  PositionVM,
} from '../../components/dumb/PositionList'
import {
  formatCryptoBalance,
  formatFiatBalance,
  formatPercent,
} from '../../helpers/formatters/format'
import { calculatePNL } from '../../helpers/multiply/calculations'
import { zero } from '../../helpers/zero'
import { calculateMultiply } from '../multiply/manage/pipes/manageMultiplyVaultCalculations'
import { PositionDetails } from './pipes/positionsList'
import { getVaultsSummary, VaultSummary } from './vaultSummary'

export interface VaultsOverview {
  positions: PositionVM[]
  vaultSummary: VaultSummary | undefined
}

export function createVaultsOverview$(
  positions$: (address: string) => Observable<PositionDetails[]>,
  address: string,
): Observable<VaultsOverview> {
  return positions$(address).pipe(
    map((positions) => {
      return {
        positions: mapToPositionVM(positions),
        vaultSummary: getVaultsSummary(positions),
      }
    }),
  )
}

function mapToPositionVM(vaults: PositionDetails[]): PositionVM[] {
  const { borrow, multiply, earn } = vaults.reduce<{
    borrow: PositionDetails[]
    multiply: PositionDetails[]
    earn: PositionDetails[]
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
      automationEnabled: isAutomationEnabled(position),
      protectionAmount: getProtectionAmount(position),
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

  const multiplyVMs: MultiplyPositionVM[] = multiply.map((position) => {
    const fundingCost = position.value.gt(zero)
      ? position.debt.div(position.value).multipliedBy(position.stabilityFee).times(100)
      : zero
    return {
      type: 'multiply' as const,
      isOwnerView: position.isOwner,
      icon: getToken(position.token).iconCircle,
      ilk: position.ilk,
      positionId: position.id.toString(),
      multiple: `${calculateMultiply({ ...position }).toFixed(2)}x`,
      netValue: `$${formatFiatBalance(position.value)}`,
      liquidationPrice: `$${formatFiatBalance(position.liquidationPrice)}`,
      fundingCost: formatPercent(fundingCost, {
        precision: 2,
      }),
      automationEnabled: isAutomationEnabled(position),
      protectionAmount: getProtectionAmount(position),
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
  })

  const earnVMs: EarnPositionVM[] = earn.map((position) => {
    return {
      type: 'earn' as const,
      isOwnerView: position.isOwner,
      icon: getToken(position.token).iconCircle,
      ilk: position.ilk,
      positionId: position.id.toString(),
      netValue: `$${formatFiatBalance(position.value)}`,
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
  })
  return [...borrowVMs, ...multiplyVMs, ...earnVMs]
}

function getPnl(vault: PositionDetails): BigNumber {
  const { lockedCollateralUSD, debt, history } = vault
  const netValueUSD = lockedCollateralUSD.minus(debt)
  return calculatePNL(history, netValueUSD)
}

function isAutomationEnabled(position: PositionDetails): boolean {
  return position.stopLossData.isStopLossEnabled || position.basicSellData.isTriggerEnabled
}

function getProtectionAmount(position: PositionDetails): string {
  let protectionAmount = zero

  if (position.stopLossData.stopLossLevel.gt(zero))
    protectionAmount = position.stopLossData.stopLossLevel.times(100)
  else if (position.basicSellData.execCollRatio.gt(zero))
    protectionAmount = position.basicSellData.execCollRatio

  return formatPercent(protectionAmount)
}
