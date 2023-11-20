import BigNumber from 'bignumber.js'
import { NetworkNames } from 'blockchain/networks'
import { AssetsTableDataCellAction } from 'components/assetsTable/cellComponents/AssetsTableDataCellAction'
import { AssetsTableDataCellAsset } from 'components/assetsTable/cellComponents/AssetsTableDataCellAsset'
import { AssetsTableDataCellInactive } from 'components/assetsTable/cellComponents/AssetsTableDataCellInactive'
import { AssetsTableDataCellRiskNoProtectionAvailableIcon } from 'components/assetsTable/cellComponents/AssetsTableDataCellRiskNoProtectionAvailableIcon'
import { AssetsTableDataCellRiskProtectionIcon } from 'components/assetsTable/cellComponents/AssetsTableDataCellRiskProtectionIcon'
import { AssetsTableDataCellRiskRatio } from 'components/assetsTable/cellComponents/AssetsTableDataCellRiskRatio'
import type { AssetsTableRowData } from 'components/assetsTable/types'
import { ProtocolLabel } from 'components/ProtocolLabel'
import { isSupportedAaveAutomationTokenPair } from 'features/automation/common/helpers/isSupportedAaveAutomationTokenPair'
import type { AutoBSTriggerData } from 'features/automation/common/state/autoBSTriggerData.types'
import type { StopLossTriggerData } from 'features/automation/protection/stopLoss/state/stopLossTriggerData.types'
import { calculateMultiply } from 'features/multiply/manage/pipes/manageMultiplyVaultCalculations'
import { getFundingCost, getProtection } from 'features/vaultsOverview/helpers'
import type { MakerPositionDetails } from 'features/vaultsOverview/pipes/positionsList'
import { getLocalAppConfig } from 'helpers/config'
import {
  formatCryptoBalance,
  formatDecimalAsPercent,
  formatPercent,
} from 'helpers/formatters/format'
import { calculatePNL } from 'helpers/multiply/calculations'
import { LendingProtocol } from 'lendingProtocols'
import React from 'react'
import { Text } from 'theme-ui'

interface PositionTableRow {
  asset: string
  icons: string[]
  id: string
  network: NetworkNames
  protocol: LendingProtocol
  url: string
  collateralToken: string
  debtToken: string
}

export interface PositionTableBorrowRow extends PositionTableRow {
  collateralLocked: BigNumber
  debt: BigNumber
  stopLossData?: StopLossTriggerData
  autoSellData?: AutoBSTriggerData
  riskRatio: {
    level?: BigNumber
    isAtRiskDanger: boolean
    isAtRiskWarning: boolean
    type: 'Coll. Ratio' | 'LTV'
  }
  isOwner?: boolean
  variable: BigNumber
}
export interface PositionTableMultiplyRow extends PositionTableRow {
  fundingCost: BigNumber
  liquidationPrice: BigNumber
  liquidationPriceToken: string
  multiple: BigNumber
  netValue: BigNumber
  stopLossData?: StopLossTriggerData
  autoSellData?: AutoBSTriggerData
  isOwner?: boolean
}
export interface PositionTableEarnRow extends PositionTableRow {
  liquidity?: BigNumber | string
  liquidityToken: string
  netValue?: BigNumber
  netValueInToken?: boolean
  pnl?: BigNumber
}

const isAutomationEnabledProtocol = (protocol: LendingProtocol, network: NetworkNames) => {
  const { AaveV3Protection: aaveProtection, SparkProtocolStopLoss: sparkProtection } =
    getLocalAppConfig('features')

  return {
    [LendingProtocol.AaveV2]: false,
    [LendingProtocol.AaveV3]: aaveProtection && network === NetworkNames.ethereumMainnet,
    [LendingProtocol.Ajna]: false,
    [LendingProtocol.Maker]: network === NetworkNames.ethereumMainnet,
    [LendingProtocol.MorphoBlue]: false,
    [LendingProtocol.SparkV3]: sparkProtection && network === NetworkNames.ethereumMainnet,
  }[protocol]
}

export function parseMakerBorrowPositionRows(
  positions: MakerPositionDetails[],
): PositionTableBorrowRow[] {
  return positions.map(
    ({
      atRiskLevelDanger,
      atRiskLevelWarning,
      collateralizationRatio,
      debt,
      id,
      ilk,
      lockedCollateral,
      stabilityFee,
      token,
      stopLossData,
      autoSellData,
      isOwner,
    }) => ({
      asset: ilk,
      collateralLocked: lockedCollateral,
      collateralToken: token,
      debt,
      debtToken: 'DAI',
      icons: [token, 'DAI'],
      id: id.toString(),
      // TODO: should get chainId from the source event so it works in the generic way for all chains
      network: NetworkNames.ethereumMainnet,
      protocol: LendingProtocol.Maker,
      riskRatio: {
        level: collateralizationRatio.times(100),
        isAtRiskDanger: atRiskLevelDanger,
        isAtRiskWarning: atRiskLevelWarning,
        type: 'Coll. Ratio',
      },
      stopLossData,
      autoSellData,
      isOwner,
      url: `/ethereum/maker/${id}`,
      variable: stabilityFee.times(100),
    }),
  )
}
export function parseMakerMultiplyPositionRows(
  positions: MakerPositionDetails[],
): PositionTableMultiplyRow[] {
  return positions.map(
    ({
      debt,
      id,
      ilk,
      liquidationPrice,
      lockedCollateralUSD,
      stabilityFee,
      token,
      value,
      stopLossData,
      autoSellData,
      isOwner,
    }) => ({
      asset: ilk,
      fundingCost: getFundingCost({ debt, stabilityFee, value }),
      icons: [token, 'DAI'],
      id: id.toString(),
      liquidationPrice,
      liquidationPriceToken: 'DAI',
      multiple: calculateMultiply({ debt, lockedCollateralUSD }),
      netValue: value,
      // TODO: should get chainId from the source event so it works in the generic way for all chains
      network: NetworkNames.ethereumMainnet,
      protocol: LendingProtocol.Maker,
      url: `/ethereum/maker/${id}`,
      stopLossData,
      autoSellData,
      isOwner,
      collateralToken: token,
      debtToken: 'DAI',
    }),
  )
}
export function parseMakerEarnPositionRows(
  positions: MakerPositionDetails[],
): PositionTableEarnRow[] {
  return positions.map(
    ({ debt, history, token, id, ilk, ilkDebtAvailable, lockedCollateralUSD, value }) => ({
      asset: ilk,
      icons: ['DAI', 'USDC'],
      id: id.toString(),
      liquidity: ilkDebtAvailable,
      liquidityToken: 'DAI',
      netValue: value,
      netValueInToken: false,
      pnl: calculatePNL(history, lockedCollateralUSD.minus(debt)).times(100),
      // TODO: should get chainId from the source event so it works in the generic way for all chains
      network: NetworkNames.ethereumMainnet,
      protocol: LendingProtocol.Maker,
      url: `/ethereum/maker/${id}`,
      debtToken: 'DAI',
      collateralToken: token,
    }),
  )
}

const isSupportedAaveV3Automation = (
  protocol: LendingProtocol,
  collateralToken: string,
  debtToken: string,
) =>
  protocol === LendingProtocol.AaveV3
    ? isSupportedAaveAutomationTokenPair(collateralToken, debtToken)
    : true // if its not AaveV3, then we skip this check

export function getBorrowPositionRows(rows: PositionTableBorrowRow[]): AssetsTableRowData[] {
  return rows.map(
    ({
      asset,
      collateralLocked,
      collateralToken,
      debt,
      debtToken,
      icons,
      id,
      network,
      protocol,
      riskRatio: { level, isAtRiskDanger, isAtRiskWarning, type },
      variable,
      url,
      stopLossData,
      autoSellData,
      isOwner,
    }) => ({
      asset: <AssetsTableDataCellAsset asset={asset} icons={icons} positionId={id} />,
      riskRatio: (
        <>
          {level ? (
            <>
              <AssetsTableDataCellRiskRatio
                level={level.toNumber()}
                isAtRiskDanger={isAtRiskDanger}
                isAtRiskWarning={isAtRiskWarning}
              />{' '}
              <Text as="small" sx={{ fontSize: 1, color: 'neutral80' }}>
                {type}
              </Text>
            </>
          ) : (
            <AssetsTableDataCellInactive />
          )}
        </>
      ),
      debt: `${formatCryptoBalance(debt)} ${debtToken}`,
      collateralLocked: `${formatCryptoBalance(collateralLocked)} ${collateralToken}`,
      variable: `${formatPercent(variable, { precision: 2 })}`,
      protocol: <ProtocolLabel network={network as NetworkNames} protocol={protocol} />,
      ...(isAutomationEnabledProtocol(protocol, network) &&
      isSupportedAaveV3Automation(protocol, collateralToken, debtToken)
        ? {
            protection: (
              <AssetsTableDataCellRiskProtectionIcon
                isOwner={isOwner}
                level={getProtection({ stopLossData, autoSellData })}
                link={url}
              />
            ),
          }
        : { protection: <AssetsTableDataCellRiskNoProtectionAvailableIcon /> }),
      action: <AssetsTableDataCellAction cta="View" link={url} />,
    }),
  )
}
export function getMultiplyPositionRows(rows: PositionTableMultiplyRow[]): AssetsTableRowData[] {
  return rows.map(
    ({
      asset,
      fundingCost,
      icons,
      id,
      liquidationPrice,
      liquidationPriceToken,
      multiple,
      netValue,
      network,
      protocol,
      url,
      stopLossData,
      autoSellData,
      isOwner,
      collateralToken,
      debtToken,
    }) => {
      const formattedLiquidationPrice = `${formatCryptoBalance(
        liquidationPrice,
      )} ${liquidationPriceToken}`

      return {
        asset: <AssetsTableDataCellAsset asset={asset} icons={icons} positionId={id} />,
        netValue: `$${formatCryptoBalance(netValue)}`,
        multiple: `${multiple.toFixed(2)}x`,
        liquidationPrice: formattedLiquidationPrice,
        fundingCost: `${formatPercent(fundingCost, { precision: 2 })}`,
        protocol: <ProtocolLabel network={network as NetworkNames} protocol={protocol} />,
        ...(isAutomationEnabledProtocol(protocol, network) &&
        isSupportedAaveV3Automation(protocol, collateralToken, debtToken)
          ? {
              protection: (
                <AssetsTableDataCellRiskProtectionIcon
                  isOwner={isOwner}
                  level={getProtection({ stopLossData, autoSellData })}
                  link={url}
                />
              ),
            }
          : { protection: <AssetsTableDataCellRiskNoProtectionAvailableIcon /> }),
        action: <AssetsTableDataCellAction cta="View" link={url} />,
      }
    },
  )
}
export function getEarnPositionRows(rows: PositionTableEarnRow[]): AssetsTableRowData[] {
  return rows.map(
    ({
      asset,
      icons,
      id,
      liquidity,
      liquidityToken,
      netValue,
      netValueInToken,
      network,
      pnl,
      protocol,
      url,
    }) => ({
      asset: <AssetsTableDataCellAsset asset={asset} icons={icons} positionId={id} />,
      netValue: BigNumber.isBigNumber(netValue) ? (
        netValueInToken ? (
          `${formatCryptoBalance(netValue)} ${liquidityToken}`
        ) : (
          `$${formatCryptoBalance(netValue)}`
        )
      ) : (
        <AssetsTableDataCellInactive>{netValue}</AssetsTableDataCellInactive>
      ),
      pnl: BigNumber.isBigNumber(pnl) ? (
        formatDecimalAsPercent(pnl)
      ) : (
        <AssetsTableDataCellInactive>{pnl}</AssetsTableDataCellInactive>
      ),
      liquidity: BigNumber.isBigNumber(liquidity) ? (
        `${formatCryptoBalance(liquidity)} ${liquidityToken}`
      ) : (
        <AssetsTableDataCellInactive>{liquidity}</AssetsTableDataCellInactive>
      ),
      // automation: '',
      protocol: <ProtocolLabel network={network as NetworkNames} protocol={protocol} />,
      action: <AssetsTableDataCellAction cta="View" link={url} />,
    }),
  )
}
