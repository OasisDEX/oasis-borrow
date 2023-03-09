import { Protocol } from '@prisma/client'
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
import { LendingProtocol } from 'lendingProtocols/LendingProtocol'

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
  'skipShareButton',
  'url',
]
export const followTableSkippedHeaders = ['icon', 'ilk', 'protection', 'liquidityToken', 'url']

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
  autoSellData?: AutoBSTriggerData
}): number {
  return (stopLossData?.stopLossLevel.gt(zero)
    ? stopLossData.stopLossLevel.times(100)
    : autoSellData?.execCollRatio.gt(zero)
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
        icon: getToken(token).iconCircle,
        asset: title,
        netUSDValue: netValue?.toNumber(),
        currentMultiple: multiple.toNumber(),
        liquidationPrice: liquidationPrice.toNumber(),
        fundingCost: fundingCost.toNumber(),
        ...(isOwner && { protection: getProtection({ stopLossData: stopLossData! }) }),
        cdpId: id,
        url,
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
        icon: getToken(token).iconCircle,
        asset: title,
        netUSDValue: netValue.toNumber(),
        pnl: 'Soon',
        liquidity: liquidity.toNumber(),
        liquidityToken: 'USDC',
        protection: -1,
        cdpId: id,
        url,
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
  const netValue =
    dsr?.pots.dsr.value && 'dai' in dsr?.pots.dsr.value ? dsr.pots.dsr.value.dai : zero

  const dsrPosition = [
    {
      icon: getToken('DAI').iconCircle,
      asset: 'DAI Savings Rate',
      netUSDValue: netValue.toNumber(),
      pnl: 'Soon',
      liquidity: 'Unlimited',
      protection: -1,
      url: `/earn/dsr/${address}`,
      ...(skipShareButton && { skipShareButton }),
    },
  ]

  return netValue.gt(zero) ? dsrPosition : []
}

export function protocolToLendingProtocol(protocol: Protocol): LendingProtocol {
  return protocol === Protocol.aavev2 ? LendingProtocol.AaveV2 : LendingProtocol.AaveV3
}