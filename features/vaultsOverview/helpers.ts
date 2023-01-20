import BigNumber from 'bignumber.js'
import { getToken } from 'blockchain/tokensMetadata'
import { AutoBSTriggerData } from 'features/automation/common/state/autoBSTriggerData'
import { StopLossTriggerData } from 'features/automation/protection/stopLoss/state/stopLossTriggerData'
import { DiscoverTableRowData } from 'features/discover/types'
import { Dsr } from 'features/dsr/utils/createDsr'
import { calculateMultiply } from 'features/multiply/manage/pipes/manageMultiplyVaultCalculations'
import { AavePosition } from 'features/vaultsOverview/pipes/positions'
import { MakerPositionDetails } from 'features/vaultsOverview/pipes/positionsList'
import { calculatePNL } from 'helpers/multiply/calculations'
import { zero } from 'helpers/zero'

export const positionsTableTooltips = [
  'collateralLocked',
  'colRatio',
  'currentMultiple',
  'fundingCost',
  'liquidationPrice',
  'liquidity',
  'netUSDValue',
  'pnl',
  'protection',
  'variable',
  'vaultDebt',
]
export const positionsTableSkippedHeaders = ['icon', 'ilk', 'liquidityToken', 'url']
export const followTableSkippedHeaders = ['icon', 'ilk', 'protection', 'liquidityToken', 'url']

function getFundingCost({
  debt,
  stabilityFee,
  value,
}: {
  debt: BigNumber
  stabilityFee: BigNumber
  value: BigNumber
}) {
  return value.gt(zero) ? debt.div(value).multipliedBy(stabilityFee).times(100) : zero
}

function getProtection({
  stopLossData,
  autoSellData,
}: {
  stopLossData: StopLossTriggerData
  autoSellData: AutoBSTriggerData
}): number {
  return (stopLossData.stopLossLevel.gt(zero)
    ? stopLossData.stopLossLevel.times(100)
    : autoSellData.execCollRatio.gt(zero)
    ? autoSellData.execCollRatio
    : zero
  ).toNumber()
}

function getMakerPositionOfType(position: MakerPositionDetails[]) {
  return position.reduce<{
    borrow: MakerPositionDetails[]
    multiply: MakerPositionDetails[]
    earn: MakerPositionDetails[]
  }>(
    (v, position) => {
      if (position.token === 'GUNIV3DAIUSDC1' || position.token === 'GUNIV3DAIUSDC2')
        v.earn.push(position)
      else if (position.type === 'borrow') v.borrow.push(position)
      else if (position.type === 'multiply') v.multiply.push(position)

      return v
    },
    { borrow: [], multiply: [], earn: [] },
  )
}

function getAavePositionOfType(position: AavePosition[]) {
  return position.reduce<{
    multiply: AavePosition[]
    earn: AavePosition[]
  }>(
    (v, position) => {
      if (position.type === 'earn') v.earn.push(position)
      else if (position.type === 'multiply') v.multiply.push(position)

      return v
    },
    { multiply: [], earn: [] },
  )
}

export function getMakerBorrowPositions(positions: MakerPositionDetails[]): DiscoverTableRowData[] {
  return getMakerPositionOfType(positions).borrow.map(
    ({
      atRiskLevelDanger,
      atRiskLevelWarning,
      autoSellData,
      collateralizationRatio,
      debt,
      id,
      ilk,
      isOwner,
      lockedCollateral,
      stabilityFee,
      stopLossData,
      token,
    }) => ({
      asset: token,
      ilk,
      colRatio: {
        level: collateralizationRatio.times(100).toNumber(),
        isAtRiskDanger: atRiskLevelDanger,
        isAtRiskWarning: atRiskLevelWarning,
      },
      vaultDebt: debt.toNumber(),
      collateralLocked: lockedCollateral.toNumber(),
      variable: stabilityFee.times(100).toNumber(),
      ...(isOwner && { protection: getProtection({ stopLossData, autoSellData }) }),
      cdpId: id.toNumber(),
    }),
  )
}

export function getMakerMultiplyPositions(
  positions: MakerPositionDetails[],
): DiscoverTableRowData[] {
  return getMakerPositionOfType(positions).multiply.map(
    ({
      autoSellData,
      debt,
      id,
      ilk,
      isOwner,
      liquidationPrice,
      lockedCollateralUSD,
      stabilityFee,
      stopLossData,
      token,
      value,
    }) => ({
      asset: token,
      ilk,
      netUSDValue: value.toNumber(),
      currentMultiple: calculateMultiply({ debt, lockedCollateralUSD }).toNumber(),
      liquidationPrice: liquidationPrice.toNumber(),
      fundingCost: getFundingCost({ debt, stabilityFee, value }).toNumber(),
      ...(isOwner && { protection: getProtection({ stopLossData, autoSellData }) }),
      cdpId: id.toNumber(),
    }),
  )
}

export function getMakerEarnPositions(positions: MakerPositionDetails[]): DiscoverTableRowData[] {
  return getMakerPositionOfType(positions).earn.map(
    ({ debt, history, id, ilk, ilkDebtAvailable, lockedCollateralUSD, token, value }) => {
      return {
        asset: token,
        ilk,
        netUSDValue: value.toNumber(),
        pnl: calculatePNL(history, lockedCollateralUSD.minus(debt)).times(100).toNumber(),
        liquidity: ilkDebtAvailable.toNumber(),
        protection: -1,
        cdpId: id.toNumber(),
      }
    },
  )
}

export function getAaveMultiplyPositions(positions: AavePosition[]): DiscoverTableRowData[] {
  return getAavePositionOfType(positions).multiply.map(
    ({ fundingCost, id, liquidationPrice, multiple, netValue, title, token, url }) => {
      return {
        icon: getToken(token).iconCircle,
        asset: title,
        netUSDValue: netValue.toNumber(),
        currentMultiple: multiple.toNumber(),
        liquidationPrice: liquidationPrice.toNumber(),
        fundingCost: fundingCost.toNumber(),
        protection: -1,
        cdpId: id,
        url,
      }
    },
  )
}

export function getAaveEarnPositions(positions: AavePosition[]): DiscoverTableRowData[] {
  return getAavePositionOfType(positions).earn.map(
    ({ id, liquidity, netValue, title, token, url }) => {
      return {
        icon: getToken(token).iconCircle,
        asset: title,
        netUSDValue: netValue.toNumber(),
        pnl: 'n/a',
        liquidity: liquidity.toNumber(),
        liquidityToken: 'USDC',
        protection: -1,
        cdpId: id,
        url,
      }
    },
  )
}

export function getDsrPosition({
  address,
  dsr,
}: {
  address: string
  dsr?: Dsr
}): DiscoverTableRowData[] {
  const netValue =
    dsr?.pots.dsr.value && 'dai' in dsr?.pots.dsr.value ? dsr.pots.dsr.value.dai : zero

  const dsrPosition = [
    {
      icon: getToken('DAI').iconCircle,
      asset: 'DAI Savings Rate',
      netUSDValue: netValue.toNumber(),
      pnl: 'n/a',
      liquidity: 'Unlimited',
      protection: -1,
      url: `/earn/dsr/${address}`,
    },
  ]

  return netValue.gt(zero) ? dsrPosition : []
}
