import { Icon } from '@makerdao/dai-ui-icons'
import { StatefulTooltip } from 'components/Tooltip'
import { WithChildren } from 'helpers/types'
import React from 'react'
import { Box, Flex, Grid, SxStyleProp, Text } from 'theme-ui'

export type EarnTableHeaderVM = {
  label: string
  tooltip?: JSX.Element | string
}

function EarnTableHeader({ label, tooltip }: EarnTableHeaderVM) {
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

function pad(count: number) {
  return Array(count).fill(<div />)
}

function EarnTableCell({ children }: WithChildren) {
  return (
    <Box sx={{ pt: 1, pb: 3 }}>
      <Text sx={{ color: 'primary' }}>{children}</Text>
    </Box>
  )
}

export function EarnTable({
  headerData,
  rows,
  sx,
}: {
  headerData: EarnTableHeaderVM[]
  rows: (JSX.Element | string)[][]
  sx?: SxStyleProp
}) {
  const columnCount = Math.max(headerData.length, ...rows.map((row) => row.length))
  const paddedRows = rows.map((row) => row.concat(pad(columnCount - row.length)))
  return (
    <Grid sx={{ gridTemplateColumns: `repeat(${columnCount}, auto)`, gap: 4, ...sx }}>
      {headerData.map((headerVM, index) => (
        <EarnTableHeader key={index} {...headerVM} />
      ))}{' '}
      {pad(columnCount - headerData.length)}
      {paddedRows.flat().map((cellContent, index) => (
        <EarnTableCell key={index}>{cellContent}</EarnTableCell>
      ))}
    </Grid>
  )
}
