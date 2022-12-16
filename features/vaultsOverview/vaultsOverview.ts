import { BigNumber } from 'bignumber.js'
import { getToken } from 'blockchain/tokensMetadata'
import {
  BorrowPositionVM,
  EarnPositionVM,
  MultiplyPositionVM,
  PositionVM,
} from 'components/dumb/PositionList'
import { VaultViewMode } from 'components/vault/GeneralManageTabBar'
import {
  formatAddress,
  formatCryptoBalance,
  formatFiatBalance,
  formatPercent,
} from 'helpers/formatters/format'
import { calculatePNL } from 'helpers/multiply/calculations'
import { zero } from 'helpers/zero'
import { combineLatest, Observable } from 'rxjs'
import { map } from 'rxjs/operators'

import { calculateMultiply } from '../multiply/manage/pipes/manageMultiplyVaultCalculations'
import { AaveDpmPosition, AavePosition } from './pipes/positions'
import { MakerPositionDetails } from './pipes/positionsList'

export interface VaultsOverview {
  positions: PositionVM[]
}

export function createVaultsOverview$(
  makerPositions$: (address: string) => Observable<MakerPositionDetails[]>,
  aavePositions$: (address: string) => Observable<AavePosition | undefined>,
  aaveDpmPositions$: (address: string) => Observable<AaveDpmPosition[]>,
  address: string,
): Observable<VaultsOverview> {
  return combineLatest(
    makerPositions$(address),
    aavePositions$(address),
    aaveDpmPositions$(address),
  ).pipe(
    map(([makerPositions, aavePositions, aaveDpmPositions]) => {
      const makerVMs = mapToPositionVM(makerPositions)
      const aaveVMs = mapAavePositions(aavePositions ? [aavePositions] : [])
      const aaveDpmVMs = mapAaveDpmPositions(aaveDpmPositions)
      return {
        positions: [...makerVMs, ...aaveVMs, ...aaveDpmVMs],
      }
    }),
  )
}

function mapToPositionVM(vaults: MakerPositionDetails[]): PositionVM[] {
  const { borrow, multiply, earn } = vaults.reduce<{
    borrow: MakerPositionDetails[]
    multiply: MakerPositionDetails[]
    earn: MakerPositionDetails[]
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
      collateralLocked: `${formatCryptoBalance(position.lockedCollateral)} ${position.token}`,
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

function mapAavePositions(position: AavePosition[]): PositionVM[] {
  return position.map((position) => {
    return {
      type: 'earn' as const,
      isOwnerView: true,
      icon: getToken(position.token).iconCircle,
      ilk: position.title,
      positionId: formatAddress(position.ownerAddress),
      pnl: position.pln,
      netValue: `$${formatFiatBalance(position.netValue)}`,
      sevenDayYield: '',
      liquidity: `${formatCryptoBalance(position.liquidity)} USDC`,
      editLinkProps: {
        href: position.url,
        hash: VaultViewMode.Overview,
        internalInNewTab: false,
      },
    }
  })
}

function mapAaveDpmPositions(position: AaveDpmPosition[]): PositionVM[] {
  return position.map((position) => {
    if (position.type === 'multiply') {
      return {
        type: 'multiply' as const,
        isOwnerView: position.isOwner,
        icon: getToken(position.token).iconCircle,
        ilk: position.title,
        positionId: position.id.toString(),
        multiple: `${position.multiple.toFixed(2)}x`,
        netValue: `$${formatFiatBalance(position.netValue)}`,
        liquidationPrice: `$${formatFiatBalance(position.liquidationPrice)}`,
        fundingCost: formatPercent(position.fundingCost, {
          precision: 2,
        }),
        collateralLocked: `${formatCryptoBalance(position.lockedCollateral)} ${position.token}`,
        automationEnabled: false,
        editLinkProps: {
          href: position.url,
          hash: VaultViewMode.Overview,
          internalInNewTab: false,
        },
      }
    } else {
      return {
        type: 'earn' as const,
        isOwnerView: position.isOwner,
        icon: getToken(position.token).iconCircle,
        ilk: position.title,
        positionId: position.id.toString(),
        multiple: `${position.multiple.toFixed(2)}x`,
        netValue: `$${formatFiatBalance(position.netValue)}`,
        liquidationPrice: `$${formatFiatBalance(position.liquidationPrice)}`,
        fundingCost: formatPercent(position.fundingCost, {
          precision: 2,
        }),
        collateralLocked: `${formatCryptoBalance(position.lockedCollateral)} ${position.token}`,
        automationEnabled: false,
        editLinkProps: {
          href: position.url,
          hash: VaultViewMode.Overview,
          internalInNewTab: false,
        },
        pnl: 'N/A',
        sevenDayYield: 'sevenDayYield',
        liquidity: 'liquidity',
      }
    }
  })
}

function getPnl(vault: MakerPositionDetails): BigNumber {
  const { lockedCollateralUSD, debt, history } = vault
  const netValueUSD = lockedCollateralUSD.minus(debt)
  return calculatePNL(history, netValueUSD)
}

function isAutomationEnabled(position: MakerPositionDetails): boolean {
  return position.stopLossData.isStopLossEnabled || position.autoSellData.isTriggerEnabled
}

function getProtectionAmount(position: MakerPositionDetails): string {
  let protectionAmount = zero

  if (position.stopLossData.stopLossLevel.gt(zero))
    protectionAmount = position.stopLossData.stopLossLevel.times(100)
  else if (position.autoSellData.execCollRatio.gt(zero))
    protectionAmount = position.autoSellData.execCollRatio

  return formatPercent(protectionAmount)
}
