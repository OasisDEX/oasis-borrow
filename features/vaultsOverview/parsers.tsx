import BigNumber from 'bignumber.js'
import { getToken } from 'blockchain/tokensMetadata'
import { AppLink } from 'components/Links'
import {
  DiscoverTableDataCellAsset,
  DiscoverTableDataCellProtocol,
  DiscoverTableDataCellProtocols,
  DiscoverTableDataCellRiskRatio,
} from 'features/discover/common/DiscoverTableDataCellComponents'
import { DiscoverTableRowData } from 'features/discover/types'
import { MakerPositionDetails } from 'features/vaultsOverview/pipes/positionsList'
import { formatCryptoBalance, formatPercent } from 'helpers/formatters/format'
import { Button } from 'theme-ui'

interface PositionTableRow {
  asset: string
  icon: string
  id: BigNumber
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
      icon: token,
      id,
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

export function getBorrowPositionRows(rows: PositionTableBorrowRow[]): DiscoverTableRowData[] {
  return rows.map(
    ({
      asset,
      collateralLocked,
      collateralToken,
      debt,
      debtToken,
      icon,
      id,
      protocol,
      riskRatio: { level, isAtRiskDanger, isAtRiskWarning, type },
      variable,
      url,
    }) => ({
      asset: (
        <DiscoverTableDataCellAsset
          asset={asset}
          icon={getToken(icon).iconCircle}
          id={id.toNumber()}
        />
      ),
      riskRatio: (
        <>
          <DiscoverTableDataCellRiskRatio
            level={level.toNumber()}
            isAtRiskDanger={isAtRiskDanger}
            isAtRiskWarning={isAtRiskWarning}
          />{' '}
          {type}
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
      protocol: <DiscoverTableDataCellProtocol protocol={protocol} />,
      automation: '',
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
