import { Icon } from '@makerdao/dai-ui-icons'
import { StatefulTooltip } from 'components/Tooltip'
import { WithChildren } from 'helpers/types'
import _ from 'lodash'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Box, Button, Flex, Grid, Text } from 'theme-ui'

function DumbHeader({ label, tooltip }: {
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
          <Icon name="question_o" size="16px" sx={{ ml: 1, flexShrink: 0 }} color="text.subtitle" />
        </StatefulTooltip>
      )}
    </Flex>
  )
}

function Header({ name } : {name: string}) {
  const { t } = useTranslation()
  return <DumbHeader label={t(`earn.position-headers.${name}.label`)} tooltip={t(`earn.position-headers.${name}.tooltip`)} />
}

function Cell({ children }:  WithChildren) {
  return (
    <Box sx={{ py: 2, color: 'primary' }}>
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

interface InfoItem {
  header: JSX.Element
  info: JSX.Element | string
}

function getPositionInfoItems(position: PositionVM): InfoItem[] {

  const assetInfo = {
    header: <Header name="asset" />,
    info: <Flex sx={{ alignItems: 'center' }}>
      <Icon name={position.icon} size="36px" sx={{ mr: 2, flexShrink: 0 }} /> {position.ilk}
    </Flex>
  }

  const vaultIdInfo = {
    header: <Header name="vault-id" />,
    info: position.vaultID
  }

  switch (position.type) {
    case 'borrow': return [assetInfo, vaultIdInfo,
      {
        header: <Header name="collateral-ratio" />,
        info: <Text sx={{ color: position.inDanger ? '#D94A1E' : 'onSuccess' }}>{position.collateralRatio}</Text>
      },{
        header: <Header name="dai-debt" />,
        info: position.daiDebt
      },{
        header: <Header name="collateral-locked" />,
        info: position.collateralLocked
      },{
        header: <Header name="variable-perc" />,
        info: position.variable
      },{
        header: <Header name="automation" />,
        info: position.automationEnabled ? 
          <Button variant="actionActiveGreen" onClick={() => position.onAutomationClick()}>On</Button> : 
          <Button variant="action" onClick={() => position.onAutomationClick()}>Activate</Button>
      },
    ]
    case 'multiply': return [assetInfo, vaultIdInfo,
      {
        header: <Header name="net-value" />,
        info: position.netValue
      },
      {
        header: <Header name="multiple" />,
        info: position.multiple
      },
      {
        header: <Header name="liquidation-price" />,
        info: position.liquidationPrice
      },
      {
        header: <Header name="funding-cost" />,
        info: position.fundingCost
      },
      {
        header: <Header name="automation" />,
        info: position.automationEnabled ? 
          <Button variant="actionActiveGreen" onClick={() => position.onAutomationClick()}>On</Button> : 
          <Button variant="action" onClick={() => position.onAutomationClick()}>Activate</Button>
      },
    ]
    case 'earn': return [assetInfo, vaultIdInfo,
      {
        header: <Header name="net-value" />,
        info: position.netValue
      },
      {
        header: <Header name="pnl" />,
        info: position.pnl
      },
      {
        header: <Header name="seven-day-yield" />,
        info: position.sevenDayYield
      },
      {
        header: <Header name="liquidity" />,
        info: position.liquidity
      },
    ]
  }
}

export function PositionList({ positions }: { positions: PositionVM[] }) {
  const columnCount = 8
  const positionsByType = _.groupBy(positions, 'type')

  function pad(items: any[], count: number) { 
    return items.concat(new Array(count - items.length).fill(<div />))
  }
  return <Box>
    Your positions ({positions.length})

    {/* DESKTOP */}
    <Grid sx={{ gridTemplateColumns: `200px repeat(${columnCount - 1}, auto)`, gap: 4, alignItems: 'center', display: ['none', 'grid'], 'button': { width: '100%'} }}>
    {Object.entries(positionsByType).map(([type, positions]) => {
      const headers = pad(getPositionInfoItems(positions[0]).map(infoItem => infoItem.header), columnCount)
      return <><Box sx={{ gridColumn: `1 / span ${columnCount}`}}>
        {type} Positions ({positions.length})
      </Box>
      {headers}
      {positions.map(position => 
        <>
          {pad(getPositionInfoItems(position).map(infoItem => <Cell>{infoItem.info}</Cell>), columnCount - 1)}
          <Button variant="secondary" onClick={() => position.onEditClick()}>Edit Vault</Button>
        </>
      )}
      </>
    })}
    </Grid>

    {/* MOBILE */}
    <Box sx={{ display: ['block', 'none']}}>
    {Object.entries(positionsByType).map(([type, positions], index) => {
      return <Box sx={{ maxWidth: '600px' }}>
        <Text>Oasis {type} ({positions.length})</Text>
        {positions.map(position => <Grid>
          <Grid sx={{ gridTemplateColumns: '1fr 1fr', justifyItems: 'start'}}>
            {getPositionInfoItems(position).map(({header, info}) => <Box>
              {header}
              {info}
            </Box>)}
          </Grid>
          <Button variant="secondary" onClick={() => position.onEditClick()}>Edit Vault</Button>
        </Grid>)}
        {index < positions.length && '(separator)'}
      </Box>
    })}
    </Box>
  </Box>
  


}
