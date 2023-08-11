import {
  AjnaEarnPosition,
  AjnaPosition,
  getPoolLiquidity,
  negativeToZero,
} from '@oasisdex/dma-library'
import BigNumber from 'bignumber.js'
import { NetworkNames, networksById } from 'blockchain/networks'
import { AssetsTableDataCellAction } from 'components/assetsTable/cellComponents/AssetsTableDataCellAction'
import { AssetsTableDataCellAsset } from 'components/assetsTable/cellComponents/AssetsTableDataCellAsset'
import { AssetsTableDataCellInactive } from 'components/assetsTable/cellComponents/AssetsTableDataCellInactive'
import { AssetsTableDataCellRiskNoProtectionAvailableIcon } from 'components/assetsTable/cellComponents/AssetsTableDataCellRiskNoProtectionAvailableIcon'
import { AssetsTableDataCellRiskProtectionIcon } from 'components/assetsTable/cellComponents/AssetsTableDataCellRiskProtectionIcon'
import { AssetsTableDataCellRiskRatio } from 'components/assetsTable/cellComponents/AssetsTableDataCellRiskRatio'
import { AssetsTableRowData } from 'components/assetsTable/types'
import { ProtocolLabel } from 'components/ProtocolLabel'
import { isPoolOracless } from 'features/ajna/common/helpers/isOracless'
import { AjnaPositionDetails } from 'features/ajna/positions/common/observables/getAjnaPosition'
import { isSupportedAaveAutomationTokenPair } from 'features/automation/common/helpers'
import { AutoBSTriggerData } from 'features/automation/common/state/autoBSTriggerData'
import { StopLossTriggerData } from 'features/automation/protection/stopLoss/state/stopLossTriggerData'
import { Dsr } from 'features/dsr/utils/createDsr'
import { calculateMultiply } from 'features/multiply/manage/pipes/manageMultiplyVaultCalculations'
import { getDsrValue, getFundingCost, getProtection } from 'features/vaultsOverview/helpers'
import { AavePosition } from 'features/vaultsOverview/pipes/positions'
import { MakerPositionDetails } from 'features/vaultsOverview/pipes/positionsList'
import {
  formatAddress,
  formatCryptoBalance,
  formatDecimalAsPercent,
  formatPercent,
} from 'helpers/formatters/format'
import { calculatePNL } from 'helpers/multiply/calculations'
import { useFeatureToggle } from 'helpers/useFeatureToggle'
import { zero } from 'helpers/zero'
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
}

export interface PositionTableBorrowRow extends PositionTableRow {
  collateralLocked: BigNumber
  collateralToken: string
  debt: BigNumber
  debtToken: string
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
  pnl?: BigNumber
}

const isAutomationEnabledProtocol = (protocol: LendingProtocol, network: NetworkNames) => {
  const aaveProtection = useFeatureToggle('AaveV3Protection')
  return {
    [LendingProtocol.Maker]: network === NetworkNames.ethereumMainnet,
    [LendingProtocol.AaveV3]: aaveProtection && network === NetworkNames.ethereumMainnet,
    [LendingProtocol.AaveV2]: false,
    [LendingProtocol.Ajna]: false,
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
      multiple: calculateMultiply({ debt, lockedCollateralUSD }),
      netValue: value,
      // TODO: should get chainId from the source event so it works in the generic way for all chains
      network: NetworkNames.ethereumMainnet,
      protocol: LendingProtocol.Maker,
      url: `/ethereum/maker/${id}`,
      stopLossData,
      autoSellData,
      isOwner,
    }),
  )
}
export function parseMakerEarnPositionRows(
  positions: MakerPositionDetails[],
): PositionTableEarnRow[] {
  return positions.map(
    ({ debt, history, id, ilk, ilkDebtAvailable, lockedCollateralUSD, value }) => ({
      asset: ilk,
      icons: ['DAI', 'USDC'],
      id: id.toString(),
      liquidity: ilkDebtAvailable,
      liquidityToken: 'DAI',
      netValue: value,
      pnl: calculatePNL(history, lockedCollateralUSD.minus(debt)).times(100),
      // TODO: should get chainId from the source event so it works in the generic way for all chains
      network: NetworkNames.ethereumMainnet,
      protocol: LendingProtocol.Maker,
      url: `/ethereum/maker/${id}`,
    }),
  )
}

export function parseAaveBorrowPositionRows(positions: AavePosition[]): PositionTableBorrowRow[] {
  return positions.map((position) => ({
    asset: `${position.token}/${position.debtToken}`,
    collateralLocked: position.lockedCollateral,
    collateralToken: position.token,
    debt: position.debt,
    debtToken: position.debtToken,
    icons: [position.token, position.debtToken],
    id: position.id.toString(),
    network: networksById[position.chainId].name,
    protocol: position.protocol,
    riskRatio: {
      level: position.riskRatio.loanToValue,
      isAtRiskDanger: position.isAtRiskDanger,
      isAtRiskWarning: position.isAtRiskWarning,
      type: 'LTV',
    },
    stopLossData: position.stopLossData,
    autoSellData: position.autoSellData,
    isOwner: position.isOwner,
    url: position.url,
    variable: position.variableBorrowRate,
  }))
}

export function parseAaveMultiplyPositionRows(
  positions: AavePosition[],
): PositionTableMultiplyRow[] {
  return positions.map(
    ({
      debtToken,
      fundingCost,
      id,
      liquidationPrice,
      multiple,
      netValue,
      protocol,
      token,
      url,
      chainId,
      stopLossData,
      autoSellData,
      isOwner,
    }) => ({
      asset: `${token}/${debtToken}`,
      fundingCost,
      icons: [token, debtToken],
      id,
      liquidationPrice,
      multiple,
      netValue,
      network: networksById[chainId].name,
      protocol,
      url,
      stopLossData,
      autoSellData,
      isOwner,
    }),
  )
}
export function parseAaveEarnPositionRows(positions: AavePosition[]): PositionTableEarnRow[] {
  return positions.map(({ debtToken, id, liquidity, netValue, protocol, token, url, chainId }) => ({
    asset: `${token}/${debtToken}`,
    icons: [token, debtToken],
    id,
    liquidity,
    liquidityToken: 'USDC',
    netValue,
    network: networksById[chainId].name,
    protocol,
    url,
  }))
}
export function parseAjnaBorrowPositionRows(
  positions: AjnaPositionDetails[],
): PositionTableBorrowRow[] {
  return positions.map(
    ({
      details: { collateralToken, collateralTokenAddress, quoteToken, quoteTokenAddress, vaultId },
      position,
    }) => {
      const isOracless = isPoolOracless({ collateralToken, quoteToken })
      const poolUrl = isOracless
        ? `${collateralTokenAddress}-${quoteTokenAddress}`
        : `${collateralToken}-${quoteToken}`
      const {
        collateralAmount,
        debtAmount,
        pool: { interestRate },
        riskRatio,
      } = position as AjnaPosition

      return {
        asset: `${collateralToken}/${quoteToken}`,
        collateralLocked: collateralAmount,
        collateralToken,
        debt: debtAmount,
        debtToken: quoteToken,
        icons: [collateralToken, quoteToken],
        id: vaultId,
        // TODO: should get chainId from the source event so it works in the generic way for all chains
        network: NetworkNames.ethereumMainnet,
        protocol: LendingProtocol.Ajna,
        riskRatio: {
          ...(!isOracless && {
            level: riskRatio.loanToValue.times(100),
          }),
          // TODO: get from position/lib when available
          isAtRiskDanger: false,
          isAtRiskWarning: false,
          type: 'LTV',
        },
        url: `/ethereum/ajna/borrow/${poolUrl}/${vaultId}`,
        variable: interestRate.times(100),
      }
    },
  )
}
export function parseAjnaMultiplyPositionRows(
  positions: AjnaPositionDetails[],
): PositionTableMultiplyRow[] {
  return positions.map(({ details: { collateralToken, quoteToken, vaultId }, position }) => {
    const {
      quotePrice,
      collateralPrice,
      debtAmount,
      liquidationPriceT0Np,
      riskRatio,
      pool,
      collateralAmount,
    } = position as AjnaPosition

    const netValue = collateralAmount.times(collateralPrice).minus(debtAmount.times(quotePrice))

    return {
      asset: `${collateralToken}/${quoteToken}`,
      fundingCost: getFundingCost({
        debt: debtAmount.times(quotePrice),
        stabilityFee: pool.interestRate,
        value: netValue,
      }),
      icons: [collateralToken, quoteToken],
      id: vaultId.toString(),
      liquidationPrice: liquidationPriceT0Np,
      multiple: riskRatio.multiple,
      netValue,
      network: NetworkNames.ethereumMainnet,
      protocol: LendingProtocol.Ajna,
      url: `/ethereum/ajna/multiply/${collateralToken}-${quoteToken}/${vaultId}`,
    }
  })
}
export function parseAjnaEarnPositionRows(
  positions: AjnaPositionDetails[],
): PositionTableEarnRow[] {
  return positions.map(
    ({
      details: { collateralToken, vaultId, quoteToken, collateralTokenAddress, quoteTokenAddress },
      position,
    }) => {
      const earnPosition = position as AjnaEarnPosition
      const liquidity = negativeToZero(
        getPoolLiquidity({
          buckets: position.pool.buckets,
          debt: position.pool.debt,
        }),
      )
      const isOracless = isPoolOracless({
        collateralToken,
        quoteToken,
      })
      const poolUrl = isOracless
        ? `${collateralTokenAddress}-${quoteTokenAddress}`
        : `${collateralToken}-${quoteToken}`

      return {
        asset: `${collateralToken}/${quoteToken}`,
        icons: [collateralToken, quoteToken],
        id: vaultId,
        netValue: earnPosition.netValue,
        pnl: earnPosition.pnl,
        liquidity,
        liquidityToken: quoteToken,
        // TODO: should get chainId from the source event so it works in the generic way for all chains
        network: NetworkNames.ethereumMainnet,
        protocol: LendingProtocol.Ajna,
        url: `/ethereum/ajna/earn/${poolUrl}/${vaultId}`,
      }
    },
  )
}
export function parseDsrEarnPosition({
  address,
  dsr,
}: {
  address: string
  dsr?: Dsr
}): PositionTableEarnRow[] {
  const netValue = getDsrValue(dsr)

  return netValue.gt(zero)
    ? [
        {
          asset: 'DAI Savings Rate',
          icons: ['DAI'],
          id: formatAddress(address),
          liquidity: 'Unlimited',
          liquidityToken: 'DAI',
          netValue,
          // TODO: should get chainId from the source event so it works in the generic way for all chains
          network: NetworkNames.ethereumMainnet,
          protocol: LendingProtocol.Maker,
          url: `/earn/dsr/${address}`,
        },
      ]
    : []
}

export function getBorrowPositionRows(rows: PositionTableBorrowRow[]): AssetsTableRowData[] {
  const isSupportedAaveV3Automation = (
    protocol: LendingProtocol,
    collateralToken: string,
    debtToken: string,
  ) =>
    protocol === LendingProtocol.AaveV3
      ? isSupportedAaveAutomationTokenPair(collateralToken, debtToken)
      : true // if its not AaveV3, then we skip this check
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
      multiple,
      netValue,
      network,
      protocol,
      url,
      stopLossData,
      autoSellData,
      isOwner,
    }) => {
      const formattedLiquidationPrice =
        protocol.toLowerCase() === LendingProtocol.Ajna
          ? `${formatCryptoBalance(liquidationPrice)} ${asset}`
          : `$${formatCryptoBalance(liquidationPrice)}`

      return {
        asset: <AssetsTableDataCellAsset asset={asset} icons={icons} positionId={id} />,
        netValue: `$${formatCryptoBalance(netValue)}`,
        multiple: `${multiple.toFixed(2)}x`,
        liquidationPrice: formattedLiquidationPrice,
        fundingCost: `${formatPercent(fundingCost, { precision: 2 })}`,
        protocol: <ProtocolLabel network={network as NetworkNames} protocol={protocol} />,
        ...(isAutomationEnabledProtocol(protocol, network)
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
    ({ asset, icons, id, liquidity, liquidityToken, netValue, network, pnl, protocol, url }) => ({
      asset: <AssetsTableDataCellAsset asset={asset} icons={icons} positionId={id} />,
      netValue: BigNumber.isBigNumber(netValue) ? (
        `$${formatCryptoBalance(netValue)}`
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
