import { AjnaPosition } from '@oasisdex/oasis-actions-poc'
import BigNumber from 'bignumber.js'
import { AppLink } from 'components/Links'
import { AjnaPositionDetails } from 'features/ajna/positions/common/observables/getAjnaPosition'
import {
  DiscoverTableDataCellAsset,
  DiscoverTableDataCellInactive,
  DiscoverTableDataCellProtocol,
  DiscoverTableDataCellProtocols,
  DiscoverTableDataCellRiskRatio,
} from 'features/discover/common/DiscoverTableDataCellComponents'
import { DiscoverTableRowData } from 'features/discover/types'
import { Dsr } from 'features/dsr/utils/createDsr'
import { calculateMultiply } from 'features/multiply/manage/pipes/manageMultiplyVaultCalculations'
import { getDsrValue, getFundingCost } from 'features/vaultsOverview/helpers'
import { AavePosition } from 'features/vaultsOverview/pipes/positions'
import { MakerPositionDetails } from 'features/vaultsOverview/pipes/positionsList'
import { formatAddress, formatCryptoBalance, formatPercent } from 'helpers/formatters/format'
import { calculatePNL } from 'helpers/multiply/calculations'
import { zero } from 'helpers/zero'
import { LendingProtocol } from 'lendingProtocols'
import React from 'react'
import { Button, Text } from 'theme-ui'

interface PositionTableRow {
  asset: string
  icons: string[]
  id: string
  protocol: DiscoverTableDataCellProtocols
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
      protocol: 'Maker',
      riskRatio: {
        level: collateralizationRatio.times(100),
        isAtRiskDanger: atRiskLevelDanger,
        isAtRiskWarning: atRiskLevelWarning,
        type: 'Coll. Ratio',
      },
      url: `/${id}`,
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
      protocol: 'Maker',
      url: `/${id}`,
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
      protocol: 'Maker',
      url: `/${id}`,
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
    }) => ({
      asset: `${token}/${debtToken}`,
      fundingCost,
      icons: [token, debtToken],
      id,
      liquidationPrice,
      multiple,
      netValue,
      protocol: `Aave v${protocol === LendingProtocol.AaveV2 ? '2' : '3'}`,
      url,
    }),
  )
}
export function parseAaveEarnPositionRows(positions: AavePosition[]): PositionTableEarnRow[] {
  return positions.map(({ debtToken, id, liquidity, netValue, protocol, token, url }) => ({
    asset: `${token}/${debtToken}`,
    icons: [token, debtToken],
    id,
    liquidity,
    liquidityToken: 'USDC',
    netValue,
    protocol: `Aave v${protocol === LendingProtocol.AaveV2 ? '2' : '3'}`,
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
      protocol: 'Ajna',
      riskRatio: {
        level: riskRatio.loanToValue.times(100),
        // TODO: get from position/lib when available
        isAtRiskDanger: false,
        isAtRiskWarning: false,
        type: 'LTV',
      },
      url: `/ajna/position/${vaultId}`,
      variable: interestRate.times(100),
    }
  })
}
export function parseAjnaEarnPositionRows(
  positions: AjnaPositionDetails[],
): PositionTableEarnRow[] {
  return positions.map(({ details: { collateralToken, vaultId, quoteToken } }) => ({
    asset: `${collateralToken}/${quoteToken}`,
    icons: [collateralToken, quoteToken],
    id: vaultId,
    liquidityToken: quoteToken,
    protocol: `Ajna`,
    url: `/ajna/position/${vaultId}`,
  }))
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
          protocol: 'Maker',
          url: `/earn/dsr/${address}`,
        },
      ]
    : []
}

export function getBorrowPositionRows(rows: PositionTableBorrowRow[]): DiscoverTableRowData[] {
  return rows.map(
    ({
      asset,
      collateralLocked,
      collateralToken,
      debt,
      debtToken,
      icons,
      id,
      protocol,
      riskRatio: { level, isAtRiskDanger, isAtRiskWarning, type },
      variable,
      url,
    }) => ({
      asset: <DiscoverTableDataCellAsset asset={asset} icons={icons} id={id} />,
      protocol: <DiscoverTableDataCellProtocol protocol={protocol} />,
      riskRatio: (
        <>
          <DiscoverTableDataCellRiskRatio
            level={level.toNumber()}
            isAtRiskDanger={isAtRiskDanger}
            isAtRiskWarning={isAtRiskWarning}
          />{' '}
          <Text as="small" sx={{ fontSize: 1, color: 'neutral80' }}>
            {type}
          </Text>
        </>
      ),
      debt: (
        <>
          {formatCryptoBalance(debt)} {debtToken}
        </>
      ),
      collateralLocked: (
        <>
          {formatCryptoBalance(collateralLocked)} {collateralToken}
        </>
      ),
      variable: <>{formatPercent(variable, { precision: 2 })}</>,
      // automation: '',
      action: (
        <AppLink href={url} sx={{ flexGrow: [1, null, null, 'initial'] }}>
          <Button className="discover-action" variant="tertiary">
            View
          </Button>
        </AppLink>
      ),
    }),
  )
}
export function getMultiplyPositionRows(rows: PositionTableMultiplyRow[]): DiscoverTableRowData[] {
  return rows.map(
    ({ asset, fundingCost, icons, id, liquidationPrice, multiple, netValue, protocol, url }) => ({
      asset: <DiscoverTableDataCellAsset asset={asset} icons={icons} id={id} />,
      protocol: <DiscoverTableDataCellProtocol protocol={protocol} />,
      netValue: <>${formatCryptoBalance(netValue)}</>,
      multiple: <>{multiple.toFixed(2)}x</>,
      liquidationPrice: <>${formatCryptoBalance(liquidationPrice)}</>,
      fundingCost: <>{formatPercent(fundingCost, { precision: 2 })}</>,
      // automation: '',
      action: (
        <AppLink href={url} sx={{ flexGrow: [1, null, null, 'initial'] }}>
          <Button className="discover-action" variant="tertiary">
            View
          </Button>
        </AppLink>
      ),
    }),
  )
}
export function getEarnPositionRows(rows: PositionTableEarnRow[]): DiscoverTableRowData[] {
  return rows.map(
    ({ asset, icons, id, liquidity, liquidityToken, netValue, pnl, protocol, url }) => ({
      asset: <DiscoverTableDataCellAsset asset={asset} icons={icons} id={id} />,
      protocol: <DiscoverTableDataCellProtocol protocol={protocol} />,
      netValue: BigNumber.isBigNumber(netValue) ? (
        <>${formatCryptoBalance(netValue)}</>
      ) : (
        <DiscoverTableDataCellInactive>{netValue || 'Soon'}</DiscoverTableDataCellInactive>
      ),
      pnl: BigNumber.isBigNumber(pnl) ? (
        <>${formatCryptoBalance(pnl)}</>
      ) : (
        <DiscoverTableDataCellInactive>{pnl || 'Soon'}</DiscoverTableDataCellInactive>
      ),
      liquidity: BigNumber.isBigNumber(liquidity) ? (
        <>
          {formatCryptoBalance(liquidity)} {liquidityToken}
        </>
      ) : (
        <DiscoverTableDataCellInactive>{liquidity || 'Soon'}</DiscoverTableDataCellInactive>
      ),
      // automation: '',
      action: (
        <AppLink href={url} sx={{ flexGrow: [1, null, null, 'initial'] }}>
          <Button className="discover-action" variant="tertiary">
            View
          </Button>
        </AppLink>
      ),
    }),
  )
}
