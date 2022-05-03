import { StatefulTooltip } from 'components/Tooltip'
import React from 'react'
import { Flex, Grid, SxStyleProp, Text } from 'theme-ui'
import { Icon } from '@makerdao/dai-ui-icons'

export type EarnTableHeaderVM = {
  label: string,
  tooltip?: JSX.Element | string
}

function EarnTableHeader({ label, tooltip }: EarnTableHeaderVM) {
  return <Flex sx={{ alignItems: 'center' }}>
    <Text sx={{ fontSize: 1, color: 'text.subtitle', fontWeight: 'medium' }}>{label}</Text> 
    {tooltip && <StatefulTooltip
      tooltip={
        <Text sx={{ fontWeight: 'semiBold', mb: 1, fontSize: 2, textAlign: 'left' }}>
          {tooltip}
        </Text>
      }
    >
      <Icon name="question_o" size="16px" sx={{ ml: 1 }} color="text.subtitle"/>
    </StatefulTooltip>}
  </Flex>
}

function pad(count: number) {
  return Array(count).fill(<div/>)
}

export function EarnTable({ headerData, rows, sx }: { headerData: EarnTableHeaderVM[], rows: JSX.Element[][], sx?: SxStyleProp }) {
  const columnCount = Math.max(headerData.length, ...rows.map(row => row.length))
  const paddedRows = rows.map(row => row.concat(pad(columnCount - row.length)))
  return <Grid sx={{ gridTemplateColumns: `repeat(${columnCount}, 1fr)`, ...sx }}>
    {headerData.map(headerVM => <EarnTableHeader {...headerVM} />)} {pad(columnCount - headerData.length)}
    {paddedRows.flat()}
  </Grid>
}