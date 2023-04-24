import { BigNumber } from 'bignumber.js'
import { NetworkIds } from 'blockchain/networkIds'
import { getToken } from 'blockchain/tokensMetadata'
import {
  BorrowPositionVM,
  EarnPositionVM,
  MultiplyPositionVM,
  PositionVM,
} from 'components/dumb/PositionList'
import { VaultViewMode } from 'components/vault/GeneralManageTabBar'
import { AjnaPositionDetails } from 'features/ajna/positions/common/observables/getAjnaPosition'
import { AutoBSTriggerData } from 'features/automation/common/state/autoBSTriggerData'
import { StopLossTriggerData } from 'features/automation/protection/stopLoss/state/stopLossTriggerData'
import { Dsr } from 'features/dsr/utils/createDsr'
import { calculateMultiply } from 'features/multiply/manage/pipes/manageMultiplyVaultCalculations'
import { getNetworkId } from 'features/web3Context'
import { formatCryptoBalance, formatFiatBalance, formatPercent } from 'helpers/formatters/format'
import { calculatePNL } from 'helpers/multiply/calculations'
import { zero } from 'helpers/zero'
import { combineLatest, iif, Observable, of } from 'rxjs'
import { map } from 'rxjs/operators'

import { AavePosition } from './pipes/positions'
import { MakerPositionDetails } from './pipes/positionsList'

export interface PositionsList {
  makerPositions: MakerPositionDetails[]
  aavePositions: AavePosition[]
  ajnaPositions: AjnaPositionDetails[]
  dsrPosition: Dsr
}

export interface VaultsOverview {
  positions: PositionVM[]
}

export function createPositionsList$(
  makerPositions$: (address: string) => Observable<MakerPositionDetails[]>,
  aavePositions$: (address: string) => Observable<AavePosition[]>,
  ajnaPositions$: (address: string) => Observable<AjnaPositionDetails[]>,
  dsr$: (address: string) => Observable<Dsr>,
  address: string,
): Observable<PositionsList> {
  return combineLatest(
    makerPositions$(address),
    aavePositions$(address),
    // TODO: temporary until Ajna contracts are on mainnet
    iif(
      () => getNetworkId() === NetworkIds.GOERLI,
      ajnaPositions$(address),
      of([] as AjnaPositionDetails[]),
    ),
    dsr$(address),
  ).pipe(
    map(([makerPositions, aavePositions, ajnaPositions, dsrPosition]) => ({
      makerPositions: makerPositions,
      aavePositions: aavePositions,
      ajnaPositions: ajnaPositions,
      dsrPosition: dsrPosition,
    })),
  )
}

export function createVaultsOverview$(
  makerPositions$: (address: string) => Observable<MakerPositionDetails[]>,
  aavePositions$: (address: string) => Observable<AavePosition[]>,
  address: string,
): Observable<VaultsOverview> {
  return combineLatest(makerPositions$(address), aavePositions$(address)).pipe(
    map(([makerPositions, aavePositions]) => {
      const makerVMs = mapToPositionVM(makerPositions)
      const aaveVMs = mapAavePositions(aavePositions)
      return {
        positions: [...makerVMs, ...aaveVMs],
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
        automationEnabled: isAutomationEnabled(position),
        protectionAmount: getProtectionAmount(position),
        automationLinkProps: {
          href: `/aave/${position.id}`,
          hash: VaultViewMode.Protection,
          internalInNewTab: false,
        },
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
        liquidity: `${formatFiatBalance(position.liquidity)} USDC`,
      }
    }
  })
}

function getPnl(vault: MakerPositionDetails): BigNumber {
  const { lockedCollateralUSD, debt, history } = vault
  const netValueUSD = lockedCollateralUSD.minus(debt)
  return calculatePNL(history, netValueUSD)
}

interface PositionWithProtection {
  stopLossData?: StopLossTriggerData
  autoSellData?: AutoBSTriggerData
}

function isAutomationEnabled(position: PositionWithProtection): boolean {
  return !!(position.stopLossData?.isStopLossEnabled || position.autoSellData?.isTriggerEnabled)
}

function getProtectionAmount(position: PositionWithProtection): string {
  let protectionAmount = zero

  if (position.stopLossData?.stopLossLevel.gt(zero))
    protectionAmount = position.stopLossData.stopLossLevel.times(100)
  else if (position.autoSellData?.execCollRatio.gt(zero))
    protectionAmount = position.autoSellData.execCollRatio

  return formatPercent(protectionAmount)
}
