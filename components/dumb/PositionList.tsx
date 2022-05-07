import { Icon } from '@makerdao/dai-ui-icons'
import { StatefulTooltip } from 'components/Tooltip'
import { WithChildren } from 'helpers/types'
import _ from 'lodash'
import { useTranslation } from 'next-i18next'
import React from 'react'
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
    fundingCost: renderHeader('funding-cost'),
    pnl: renderHeader('pnl'),
    sevenDayYield: renderHeader('seven-day-yield'),
    liquidity: renderHeader('liquidity'),
  }
}

function Cell({ children, sx }: { sx?: SxStyleProp } & WithChildren) {
  return (
    <Box sx={{ py: 2, color: 'primary', ...sx }}>
      <Text>{children}</Text>
    </Box>
  )
}

type PositionCommonProps = {
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
  onAutomationClick: Function
} & PositionCommonProps

type MultiplyPositionVM = {
  type: 'multiply',
  netValue: string,
  multiple: string,
  liquidationPrice: string,
  fundingCost: string
  automationEnabled: boolean,
  onAutomationClick: Function
} & PositionCommonProps

type EarnPositionVM = {
  type: 'earn',
  netValue: string,
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

export function PositionList({ positions }: { positions: PositionVM[] }) {
  const headers = useHeaders()
  const positionsByType = _.groupBy(positions, 'type')

  return <Grid sx={{ gridTemplateColumns: 'repeat(8, auto)', gap: 4, alignItems: 'center' }}>
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
          <div />,
        ]}
      {(positions as BorrowPositionVM[]).map(position => [
        <IlkWithIcon icon={position.icon} ilk={position.ilk} />,
        <Cell>{position.vaultID}</Cell>,
        <Cell sx={{ color: position.inDanger ? '#D94A1E' : 'onSuccess' }}>{position.collateralRatio}</Cell>,
        <Cell>{position.daiDebt}</Cell>,
        <Cell>{position.collateralLocked}</Cell>,
        <Cell>{position.variable}</Cell>,
        position.automationEnabled ? 
          <Button variant="outline" onClick={() => position.onAutomationClick()}>On</Button> : 
          <Button variant="outline" onClick={() => position.onAutomationClick()}>Activate</Button>,
        <Button variant="outline" onClick={() => position.onEditClick()}>Edit Vault</Button>
      ])}
      </>
      case 'multiply': return <>
        {[
          headers.asset,
          headers.vaultID,
          headers.netValue,
          headers.multiple,
          headers.liquidationPrice,
          headers.fundingCost,
          headers.automation,
          <div />,
        ]}
        {(positions as MultiplyPositionVM[]).map(position => [
          <IlkWithIcon icon={position.icon} ilk={position.ilk} />,
          <Cell>{position.vaultID}</Cell>,
          <Cell>{position.netValue}</Cell>,
          <Cell>{position.multiple}</Cell>,
          <Cell>{position.liquidationPrice}</Cell>,
          <Cell>{position.fundingCost}</Cell>,
          position.automationEnabled ? 
            <Button variant="outline" onClick={() => position.onAutomationClick()}>On</Button> : 
            <Button variant="outline" onClick={() => position.onAutomationClick()}>Activate</Button>,
          <Button variant="outline" onClick={() => position.onEditClick()}>Edit Vault</Button>
        ])}
      </>
      case 'earn': return <>
        {[
          headers.asset,
          headers.vaultID,
          headers.netValue,
          headers.pnl,
          headers.sevenDayYield,
          headers.liquidity,
          <div />,
          <div />,
        ]}
        {(positions as EarnPositionVM[]).map(position => [
          <IlkWithIcon icon={position.icon} ilk={position.ilk} />,
          <Cell>{position.vaultID}</Cell>,
          <Cell>{position.netValue}</Cell>,
          <Cell>{position.pnl}</Cell>,
          <Cell>{position.sevenDayYield}</Cell>,
          <Cell>{position.liquidity}</Cell>,
          <div />,
          <Button variant="outline" onClick={() => position.onEditClick()}>Edit Vault</Button>
        ])}
      </>
    }
  })}
  </Grid>
  


}
