import BigNumber from 'bignumber.js'
import { AssetsTableDataCellAction } from 'components/assetsTable/cellComponents/AssetsTableDataCellAction'
import { AssetsTableDataCellAsset } from 'components/assetsTable/cellComponents/AssetsTableDataCellAsset'
import { AssetsTableDataCellInactive } from 'components/assetsTable/cellComponents/AssetsTableDataCellInactive'
import { AssetsTableDataCellProtection } from 'components/assetsTable/cellComponents/AssetsTableDataCellRiskProtection'
import { AssetsTableDataCellRiskRatio } from 'components/assetsTable/cellComponents/AssetsTableDataCellRiskRatio'
import { AssetsTableRowData } from 'components/assetsTable/types'
import { AjnaPositionDetails } from 'features/ajna/positions/common/observables/getAjnaPosition'
import { AutoBSTriggerData } from 'features/automation/common/state/autoBSTriggerData'
import { StopLossTriggerData } from 'features/automation/protection/stopLoss/state/stopLossTriggerData'
import { Dsr } from 'features/dsr/utils/createDsr'
import { calculateMultiply } from 'features/multiply/manage/pipes/manageMultiplyVaultCalculations'
import { AavePosition } from 'features/vaultsOverview/pipes/positions'
import { MakerPositionDetails } from 'features/vaultsOverview/pipes/positionsList'
import { formatCryptoBalance, formatFiatBalance, formatPercent } from 'helpers/formatters/format'
import { calculatePNL } from 'helpers/multiply/calculations'
import { zero } from 'helpers/zero'
import React from 'react'

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

interface GetMakerPositionParams {
  positions: MakerPositionDetails[]
}
interface GetAavePositionParams {
  positions: AavePosition[]
}
interface GetDsrPositionParams {
  address: string
  dsr?: Dsr
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

export function getProtection({
  stopLossData,
  autoSellData,
}: {
  stopLossData?: StopLossTriggerData
  autoSellData?: AutoBSTriggerData
}): number {
  return stopLossData
    ? (stopLossData?.stopLossLevel.gt(zero)
        ? stopLossData.stopLossLevel.times(100)
        : autoSellData?.execCollRatio.gt(zero)
        ? autoSellData.execCollRatio
        : zero
      ).toNumber()
    : zero.toNumber()
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
}: GetMakerPositionParams): AssetsTableRowData[] {
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
      asset: <AssetsTableDataCellAsset asset={ilk} icons={[token]} positionId={id.toString()} />,
      colRatio: (
        <AssetsTableDataCellRiskRatio
          level={collateralizationRatio.times(100).toNumber()}
          isAtRiskDanger={atRiskLevelDanger}
          isAtRiskWarning={atRiskLevelWarning}
        />
      ),
      vaultDebt: `${formatCryptoBalance(debt)} DAI`,
      collateralLocked: `${formatCryptoBalance(lockedCollateral)} ${token}`,
      variable: `${stabilityFee.times(100).toFixed(2)}%`,
      protection: (
        <AssetsTableDataCellProtection
          isOwner={isOwner}
          level={getProtection({ stopLossData, autoSellData })}
          link={`/ethereum/maker/${id.toString()}`}
        />
      ),
      action: <AssetsTableDataCellAction link={`/ethereum/maker/${id.toString()}`} />,
    }),
  )
}

export function getMakerMultiplyPositions({
  positions,
}: GetMakerPositionParams): AssetsTableRowData[] {
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
      asset: <AssetsTableDataCellAsset asset={ilk} icons={[token]} positionId={id.toString()} />,
      netUSDValue: `$${formatFiatBalance(value)}`,
      currentMultiple: `${calculateMultiply({ debt, lockedCollateralUSD }).toFixed(2)}x`,
      liquidationPrice: `$${formatFiatBalance(liquidationPrice)}`,
      fundingCost: `${getFundingCost({ debt, stabilityFee, value }).toFixed(2)}%`,
      protection: (
        <AssetsTableDataCellProtection
          isOwner={isOwner}
          level={getProtection({ stopLossData, autoSellData })}
          link={`/ethereum/maker/${id.toString()}`}
        />
      ),
      action: <AssetsTableDataCellAction link={`/ethereum/maker/${id.toString()}`} />,
    }),
  )
}

export function getMakerEarnPositions({ positions }: GetMakerPositionParams): AssetsTableRowData[] {
  return getMakerPositionOfType(positions).earn.map(
    ({ debt, history, id, ilk, ilkDebtAvailable, lockedCollateralUSD, token, value }) => {
      return {
        asset: <AssetsTableDataCellAsset asset={ilk} icons={[token]} positionId={id.toString()} />,
        netUSDValue: `$${formatFiatBalance(value)}`,
        pnl: `${formatPercent(calculatePNL(history, lockedCollateralUSD.minus(debt)).times(100), {
          precision: 2,
        })}`,
        liquidity: `${formatCryptoBalance(ilkDebtAvailable)} DAI`,
        protection: <AssetsTableDataCellInactive />,
        action: <AssetsTableDataCellAction link={`/ethereum/maker/${id.toString()}`} />,
      }
    },
  )
}

export function getAaveMultiplyPositions({
  positions,
}: GetAavePositionParams): AssetsTableRowData[] {
  return getAavePositionOfType(positions).multiply.map(
    ({ fundingCost, id, liquidationPrice, multiple, netValue, title, token, url }) => {
      return {
        asset: <AssetsTableDataCellAsset asset={title} icons={[token]} positionId={id} />,
        netUSDValue: `$${formatFiatBalance(netValue)}`,
        currentMultiple: `${multiple.toFixed(2)}x`,
        liquidationPrice: `$${formatFiatBalance(liquidationPrice)}`,
        fundingCost: `${fundingCost.toFixed(2)}%`,
        protection: <AssetsTableDataCellInactive />,
        action: <AssetsTableDataCellAction link={url} />,
      }
    },
  )
}

export function getAaveEarnPositions({ positions }: GetAavePositionParams): AssetsTableRowData[] {
  return getAavePositionOfType(positions).earn.map(
    ({ id, liquidity, netValue, title, token, url }) => {
      return {
        asset: <AssetsTableDataCellAsset asset={title} icons={[token]} positionId={id} />,
        netUSDValue: `$${formatFiatBalance(netValue)}`,
        pnl: <AssetsTableDataCellInactive />,
        liquidity: `${formatCryptoBalance(liquidity)} USDC`,
        protection: <AssetsTableDataCellInactive />,
        action: <AssetsTableDataCellAction link={url} />,
      }
    },
  )
}

export function getDsrPosition({ address, dsr }: GetDsrPositionParams): AssetsTableRowData[] {
  const netValue = getDsrValue(dsr)

  const dsrPosition = [
    {
      asset: <AssetsTableDataCellAsset asset="DAI Savings Rate" icons={['DAI']} />,
      netUSDValue: `$${formatFiatBalance(netValue)}`,
      pnl: <AssetsTableDataCellInactive />,
      liquidity: 'Unlimited',
      protection: <AssetsTableDataCellInactive />,
      action: <AssetsTableDataCellAction link={`/earn/dsr/${address}`} />,
    },
  ]

  return netValue.gt(zero) ? dsrPosition : []
}
