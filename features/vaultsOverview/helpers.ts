import BigNumber from 'bignumber.js'
import { AjnaPositionDetails } from 'features/ajna/positions/common/observables/getAjnaPosition'
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
export const positionsTableSkippedHeaders = [
  'icon',
  'ilk',
  'liquidityToken',
  'sameTab',
  'skipShareButton',
  'url',
]
export const followTableSkippedHeaders = [
  'icon',
  'ilk',
  'liquidityToken',
  'protection',
  'sameTab',
  'url',
]

interface GetMakerPositionParams {
  positions: MakerPositionDetails[]
  skipShareButton?: boolean
}
interface GetAavePositionParams {
  positions: AavePosition[]
  skipShareButton?: boolean
}
interface GetDsrPositionParams {
  address: string
  dsr?: Dsr
  skipShareButton?: boolean
}

export function getDsrValue(dsr?: Dsr): BigNumber {
  return dsr?.pots.dsr.value && 'dai' in dsr?.pots.dsr.value ? dsr.pots.dsr.value.dai : zero
}

export function getFundingCost({
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
  autoSellData?: AutoBSTriggerData
}): number {
  return (
    stopLossData.stopLossLevel.gt(zero)
      ? stopLossData.stopLossLevel.times(100)
      : autoSellData?.execCollRatio.gt(zero)
      ? autoSellData.execCollRatio
      : zero
  ).toNumber()
}

export function getMakerPositionOfType(positions: MakerPositionDetails[]) {
  return positions.reduce<{
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

export function getAavePositionOfType(positions: AavePosition[]) {
  return positions.reduce<{
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

export function getAjnaPositionOfType(positions: AjnaPositionDetails[]) {
  return positions.reduce<{
    borrow: AjnaPositionDetails[]
    earn: AjnaPositionDetails[]
    multiply: AjnaPositionDetails[]
  }>(
    (v, position) => {
      if (position.details.product === 'borrow') v.borrow.push(position)
      else if (position.details.product === 'earn') v.earn.push(position)
      else if (position.details.product === 'multiply') v.multiply.push(position)

      return v
    },
    { borrow: [], earn: [], multiply: [] },
  )
}

export function getMakerBorrowPositions({
  positions,
  skipShareButton,
}: GetMakerPositionParams): DiscoverTableRowData[] {
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
      sameTab: true,
      ...(skipShareButton && { skipShareButton }),
    }),
  )
}

export function getMakerMultiplyPositions({
  positions,
  skipShareButton,
}: GetMakerPositionParams): DiscoverTableRowData[] {
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
      sameTab: true,
      ...(skipShareButton && { skipShareButton }),
    }),
  )
}

export function getMakerEarnPositions({
  positions,
  skipShareButton,
}: GetMakerPositionParams): DiscoverTableRowData[] {
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
        sameTab: true,
        ...(skipShareButton && { skipShareButton }),
      }
    },
  )
}

export function getAaveMultiplyPositions({
  positions,
  skipShareButton,
}: GetAavePositionParams): DiscoverTableRowData[] {
  return getAavePositionOfType(positions).multiply.map(
    ({
      fundingCost,
      id,
      liquidationPrice,
      multiple,
      netValue,
      title,
      token,
      url,
      isOwner,
      stopLossData,
    }) => {
      return {
        icon: token,
        asset: title,
        netUSDValue: netValue.toNumber(),
        currentMultiple: multiple.toNumber(),
        liquidationPrice: liquidationPrice.toNumber(),
        fundingCost: fundingCost.toNumber(),
        ...(isOwner && { protection: getProtection({ stopLossData: stopLossData! }) }),
        cdpId: id,
        url,
        sameTab: true,
        ...(skipShareButton && { skipShareButton }),
      }
    },
  )
}

export function getAaveEarnPositions({
  positions,
  skipShareButton,
}: GetAavePositionParams): DiscoverTableRowData[] {
  return getAavePositionOfType(positions).earn.map(
    ({ id, liquidity, netValue, title, token, url }) => {
      return {
        icon: token,
        asset: title,
        netUSDValue: netValue.toNumber(),
        pnl: 'Soon',
        liquidity: liquidity.toNumber(),
        liquidityToken: 'USDC',
        protection: -1,
        cdpId: id,
        url,
        sameTab: true,
        ...(skipShareButton && { skipShareButton }),
      }
    },
  )
}

export function getDsrPosition({
  address,
  dsr,
  skipShareButton,
}: GetDsrPositionParams): DiscoverTableRowData[] {
  const netValue = getDsrValue(dsr)

  const dsrPosition = [
    {
      icon: 'DAI',
      asset: 'DAI Savings Rate',
      netUSDValue: netValue.toNumber(),
      pnl: 'Soon',
      liquidity: 'Unlimited',
      protection: -1,
      url: `/earn/dsr/${address}`,
      sameTab: true,
      ...(skipShareButton && { skipShareButton }),
    },
  ]

  return netValue.gt(zero) ? dsrPosition : []
}
