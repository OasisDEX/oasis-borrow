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
import { AssetsTableDataCellRiskRatio } from 'components/assetsTable/cellComponents/AssetsTableDataCellRiskRatio'
import { AssetsTableRowData } from 'components/assetsTable/types'
import { ProtocolLabel } from 'components/ProtocolLabel'
import { AjnaPositionDetails } from 'features/ajna/positions/common/observables/getAjnaPosition'
import { Dsr } from 'features/dsr/utils/createDsr'
import { calculateMultiply } from 'features/multiply/manage/pipes/manageMultiplyVaultCalculations'
import { getDsrValue, getFundingCost } from 'features/vaultsOverview/helpers'
import { AavePosition } from 'features/vaultsOverview/pipes/positions'
import { MakerPositionDetails } from 'features/vaultsOverview/pipes/positionsList'
import {
  formatAddress,
  formatCryptoBalance,
  formatDecimalAsPercent,
  formatPercent,
} from 'helpers/formatters/format'
import { calculatePNL } from 'helpers/multiply/calculations'
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
  riskRatio: {
    level: BigNumber
    isAtRiskDanger: boolean
    isAtRiskWarning: boolean
    type: 'Coll. Ratio' | 'LTV'
  }
  variable: BigNumber
}
export interface PositionTableMultiplyRow extends PositionTableRow {
  fundingCost: BigNumber
  liquidationPrice: BigNumber
  multiple: BigNumber
  netValue: BigNumber
}
export interface PositionTableEarnRow extends PositionTableRow {
  liquidity?: BigNumber | string
  liquidityToken: string
  netValue?: BigNumber
  pnl?: BigNumber
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
      url: `/ethereum/maker/${id}`,
      variable: stabilityFee.times(100),
    }),
  )
}
export function parseMakerMultiplyPositionRows(
  positions: MakerPositionDetails[],
): PositionTableMultiplyRow[] {
  return positions.map(
    ({ debt, id, ilk, liquidationPrice, lockedCollateralUSD, stabilityFee, token, value }) => ({
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
  return positions.map(({ details: { collateralToken, vaultId, quoteToken }, position }) => {
    const {
      collateralAmount,
      debtAmount,
      pool: { interestRate },
      riskRatio,
    } = position as AjnaPosition

    return {
      asset: `${collateralToken}/${quoteToken}`,
      collateralLocked: collateralAmount,
      collateralToken: collateralToken,
      debt: debtAmount,
      debtToken: quoteToken,
      icons: [collateralToken, quoteToken],
      id: vaultId,
      // TODO: should get chainId from the source event so it works in the generic way for all chains
      network: NetworkNames.ethereumMainnet,
      protocol: LendingProtocol.Ajna,
      riskRatio: {
        level: riskRatio.loanToValue.times(100),
        // TODO: get from position/lib when available
        isAtRiskDanger: false,
        isAtRiskWarning: false,
        type: 'LTV',
      },
      url: `/ethereum/ajna/${vaultId}`,
      variable: interestRate.times(100),
    }
  })
}
export function parseAjnaEarnPositionRows(
  positions: AjnaPositionDetails[],
): PositionTableEarnRow[] {
  return positions.map(({ details: { collateralToken, vaultId, quoteToken }, position }) => {
    const earnPosition = position as AjnaEarnPosition
    const liquidity = negativeToZero(
      getPoolLiquidity({
        buckets: position.pool.buckets,
        debt: position.pool.debt,
      }),
    )

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
      url: `/ethereum/ajna/${vaultId}`,
    }
  })
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
    }) => ({
      asset: <AssetsTableDataCellAsset asset={asset} icons={icons} positionId={id} />,
      riskRatio: (
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
      ),
      debt: `${formatCryptoBalance(debt)} ${debtToken}`,
      collateralLocked: `${formatCryptoBalance(collateralLocked)} ${collateralToken}`,
      variable: `${formatPercent(variable, { precision: 2 })}`,
      // automation: '',
      protocol: <ProtocolLabel network={network as NetworkNames} protocol={protocol} />,
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
    }) => ({
      asset: <AssetsTableDataCellAsset asset={asset} icons={icons} positionId={id} />,
      netValue: `$${formatCryptoBalance(netValue)}`,
      multiple: `${multiple.toFixed(2)}x`,
      liquidationPrice: `$${formatCryptoBalance(liquidationPrice)}`,
      fundingCost: `${formatPercent(fundingCost, { precision: 2 })}`,
      // automation: '',
      protocol: <ProtocolLabel network={network as NetworkNames} protocol={protocol} />,
      action: <AssetsTableDataCellAction cta="View" link={url} />,
    }),
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
