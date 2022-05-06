import { Icon } from '@makerdao/dai-ui-icons'
import { StatefulTooltip } from 'components/Tooltip'
import { WithChildren } from 'helpers/types'
import _ from 'lodash'
import { useTranslation } from 'next-i18next'
import React, { Children, createContext, useContext } from 'react'
import { Box, Button, Flex, Grid, SxStyleProp, Text } from 'theme-ui'

function Header({ label, tooltip }: {
  label: string
  tooltip?: JSX.Element | string
}) {
  return (
    <Flex sx={{ alignItems: 'center' }}>
      <Text sx={{ fontSize: 1, color: 'text.subtitle', fontWeight: 'medium' }}>{label}</Text>
      {tooltip && (
        <StatefulTooltip
          tooltip={
            <Text sx={{ fontWeight: 'semiBold', mb: 1, fontSize: 2, textAlign: 'left' }}>
              {tooltip}
            </Text>
          }
        >
          <Icon name="question_o" size="16px" sx={{ ml: 1 }} color="text.subtitle" />
        </StatefulTooltip>
      )}
    </Flex>
  )
}

function useHeaders() {
  const { t } = useTranslation()

  const renderHeader = (headerKey: string) => 
    <Header label={t(`earn.position-headers.${headerKey}.label`)} tooltip={t(`earn.position-headers.${headerKey}.tooltip`)} />

  return {
    asset: renderHeader('asset'),
    vaultID: renderHeader('vault-id'),
    collateralRatio: renderHeader('collateral-ratio'),
    daiDebt: renderHeader('dai-debt'),
    collateralLocked: renderHeader('collateral-locked'),
    variablePerc: renderHeader('variable-perc'),
    automation: renderHeader('automation'),
    netValue: renderHeader('net-value'),
    multiple: renderHeader('multiple'),
    liquidationPrice: renderHeader('liquidation-price'),
    pnl: renderHeader('pnl'),
    sevenDayYield: renderHeader('seven-day-yield'),
    liquidity: renderHeader('liquidity'),
  }
}

function emptyDivs(count: number) {
  return Array(count).fill(<div />)
}

function Cell({ children, sx }: { sx?: SxStyleProp } & WithChildren) {
  return (
    <Box sx={{ pt: 1, pb: 3, color: 'primary', ...sx }}>
      <Text>{children}</Text>
    </Box>
  )
}

const ColumnCountContext = createContext<number>(0)

function TableGroup({ columnCount, children }: { columnCount: number } & WithChildren) {
  const arrayChildren = Children.toArray(children)
  return <ColumnCountContext.Provider value={columnCount}>
    <Grid sx={{ gridTemplateColumns: `repeat(${columnCount}, auto)`, gap: 4, alignItems: 'center' }}>
      {Children.map(arrayChildren, (child: any) => <>{child} <Box sx={{ gridColumn: `1 / span ${columnCount}` }}>------</Box> </>)}
    </Grid>
  </ColumnCountContext.Provider>
}

function Table({
  headers,
  rows,
}: {
  headers: JSX.Element[]
  rows: (JSX.Element | string)[][]
}) {
  const columnCount = useContext(ColumnCountContext)
  if (columnCount === 0) {
    throw new Error('Table should be used inside TableGroup')
  }
  const paddedRows = rows.map((row) => row.concat(pad(columnCount - row.length)))
  return (
    <>
      {headers}{' '}
      {pad(columnCount - headers.length)}
      {paddedRows.flat().map((cellContent, index) => (
        <Cell key={index}>{cellContent}</Cell>
      ))}
    </>
  )
}

type PositionCommonProps = {
  type: 'borrow' | 'multiply' | 'earn',
  icon: string,
  ilk: string,
  vaultID: string,
  onEditClick: Function,
}

type BorrowPositionVM = {
  type: 'borrow',
  collateralRatio: string,
  inDanger: boolean,
  daiDebt: string,
  collateralLocked: string,
  variable: string,
  automationEnabled: boolean,
  onAutomationBtnClick: Function
} & PositionCommonProps

type MultiplyPositionVM = {
  type: 'multiply',
  netVaule: string,
  multiple: string,
  liquidationPrice: string,
  fundingCost: string
  automationEnabled: boolean,
  onAutomationBtnClick: Function
} & PositionCommonProps

type EarnPositionVM = {
  type: 'earn',
  netVaule: string,
  pnl: string,
  sevenDayYield: string,
  liquidity: string
} & PositionCommonProps

type PositionVM = BorrowPositionVM | MultiplyPositionVM | EarnPositionVM

function IlkWithIcon({ icon, ilk }: { icon: string, ilk: string}) {
  return <Flex sx={{ alignItems: 'center', minWidth: '180px' }}>
    <Icon name={icon} size="36px" sx={{ mr: 2 }} /> {ilk}
  </Flex>
}

export function PositionsList({ positions, columnCount = 8 }: { positions: PositionVM[], columnCount?: number}) {
  const headers = useHeaders()
  const positionsByType = _.groupBy(positions, 'type')

  return <Grid sx={{ gridTemplateColumns: `repeat(${columnCount}, auto)`, gap: 4, alignItems: 'center' }}>
  {Object.entries(positionsByType).map(([type, positions]) => {
    switch(type) {
      case 'borrow': return <>
        {[
          headers.asset,
          headers.vaultID,
          headers.collateralRatio,
          headers.daiDebt,
          headers.collateralLocked,
          headers.variablePerc,
          headers.automation,
        ].concat(emptyDivs(columnCount - 7))}
      {(positions as BorrowPositionVM[]).map(position => [
        <IlkWithIcon icon={position.icon} ilk={position.ilk} />,
        <Cell>{position.vaultID}</Cell>,
        <Cell sx={{ color: position.inDanger ? '#D94A1E' : 'onSuccess' }}>{position.collateralRatio}</Cell>,
        <Cell>{position.daiDebt}</Cell>,
        <Cell>{position.collateralLocked}</Cell>,
        <Cell>{position.variable}</Cell>,
        position.automationEnabled ? 
          <Button variant="outline" onClick={() => position.onAutomationBtnClick()}>On</Button> : 
          <Button variant="outline" onClick={() => position.onAutomationBtnClick()}>Activate</Button>,
        <Button variant="outline" onClick={() => position.onEditClick()}>Edit Vault</Button>
      ])}
      </>
    }
  })}
  </Grid>
  


}
