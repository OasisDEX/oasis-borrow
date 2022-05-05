import { Icon } from '@makerdao/dai-ui-icons'
import { StatefulTooltip } from 'components/Tooltip'
import { WithChildren } from 'helpers/types'
import React, { Children, createContext, useContext } from 'react'
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
  if (count < 0) {
    throw  new Error('columnCount is less than amount of cells in row. ')
  }
  return Array(count).fill(<div />)
}

function EarnTableCell({ children }: WithChildren) {
  return (
    <Box sx={{ pt: 1, pb: 3 }}>
      <Text sx={{ color: 'primary' }}>{children}</Text>
    </Box>
  )
}

const ColumnCountContext = createContext<number>(0)

export function EarnTable({
  headerData,
  rows,
}: {
  headerData: EarnTableHeaderVM[]
  rows: (JSX.Element | string)[][]
}) {
  const columnCount = useContext(ColumnCountContext)
  if (columnCount === 0) {
    throw new Error('EarnTable should be used inside EarnTablesContainer')
  }
  const paddedRows = rows.map((row) => row.concat(pad(columnCount - row.length)))
  return (
    <>
      {headerData.map((headerVM, index) => (
        <EarnTableHeader key={index} {...headerVM} />
      ))}{' '}
      {pad(columnCount - headerData.length)}
      {paddedRows.flat().map((cellContent, index) => (
        <EarnTableCell key={index}>{cellContent}</EarnTableCell>
      ))}
    </>
  )
}

export function EarnTablesContainer({ columnCount, children }: { columnCount: number } & WithChildren) {
  const arrayChildren = Children.toArray(children)
  return <ColumnCountContext.Provider value={columnCount}>
    <Grid sx={{ gridTemplateColumns: `repeat(${columnCount}, auto)`, gap: 4, alignItems: 'center' }}>
      {Children.map(arrayChildren, (child: any) => <>{child} <Box sx={{ gridColumn: `1 / span ${columnCount}` }}>------</Box> </>)}
    </Grid>
  </ColumnCountContext.Provider>
}
