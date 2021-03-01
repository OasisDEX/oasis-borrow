import { Icon } from '@makerdao/dai-ui-icons'
import { Direction } from 'helpers/form'
import React, { memo, ReactNode } from 'react'
import { Box, Button, Container, SxStyleProp, Text } from 'theme-ui'

export interface RowDefinition<T> {
  header: ReactNode
  cell: React.ComponentType<T>
}

interface Props<T extends Record<K, string>, K extends keyof T> {
  data: T[]
  rowDefinition: RowDefinition<T>[]
  primaryKey: K
}

export function TableContainer({
  header,
  children,
  sx,
}: React.PropsWithChildren<{ header: ReactNode; sx?: SxStyleProp }>) {
  return (
    <Container
      sx={{
        display: ['flex', 'table'],
        p: 0,
        borderCollapse: 'separate',
        borderSpacing: '0 9px',
        ...sx,
      }}
      as="table"
    >
      <Box sx={{ display: ['none', 'table-header-group'] }} as="thead">
        <Box as="tr">{header}</Box>
      </Box>
      <Box sx={{ width: '100%' }} as="tbody">
        {children}
      </Box>
    </Container>
  )
}

function Row({ children, sx }: React.PropsWithChildren<{ sx?: SxStyleProp }>) {
  return (
    <Box
      sx={{
        display: ['flex', 'table-row'],
        mb: 3,
        flexDirection: 'column',
        boxShadow: 'table',
        background: 'white',
        borderRadius: '8px',
        ...sx,
      }}
      as="tr"
    >
      {children}
    </Box>
  )
}

function Cell({ children, sx }: React.PropsWithChildren<{ sx?: SxStyleProp }>) {
  return (
    <Box
      sx={{
        p: 3,
        ':first-child': {
          borderRadius: '8px 0 0 8px',
        },
        ':last-child': {
          borderRadius: '0 8px 8px 0',
        },
        ...sx,
      }}
      as="td"
    >
      {children}
    </Box>
  )
}

function Header({ children, sx }: React.PropsWithChildren<{ sx?: SxStyleProp }>) {
  return (
    <Box
      variant="paragraph2"
      sx={{
        px: 3,
        color: 'text.muted',
        fontSize: 2,
        textAlign: 'left',
        ...sx,
      }}
      as="th"
    >
      {children}
    </Box>
  )
}

const MyRow = memo(({ row, rowDefinition }: { row: any, rowDefinition: any[] }) => {
  return (
    <Row>
      {rowDefinition.map(({ cell: Content, header }, idx) => (
        <Cell
          sx={{ display: ['flex', 'table-cell'], justifyContent: 'space-between' }}
          key={idx}
        >
          <Content {...row} />
        </Cell>
      ))}
    </Row>
  )
})
export function Table<T extends Record<K, string>, K extends keyof T>({
  data,
  rowDefinition,
  primaryKey,
}: Props<T, K>) {
  return (
    <TableContainer
      header={rowDefinition.map(({ header }, index) => (
        <Header key={index}>{header}</Header>
      ))}
    >
      {data.map((row) => (<MyRow key={row[primaryKey]} row={row} rowDefinition={rowDefinition} />))}
    </TableContainer>
  )
}

interface TableProps<H, R> {
  columns: {
    header: string
    th?: (header: H) => ReactNode
    cell: (row: R) => ReactNode
  }[];
  headerState: H,
  rows: R

}

export function Table2<T extends Record<K, string>, K extends keyof T>({
  data,
  rowDefinition,
  primaryKey,
}: Props<T, K>) {
  return (
    <TableContainer
      header={rowDefinition.map(({ header }, index) => (
        <Header key={index}>{header}</Header>
      ))}
    >
      {data.map((row) => (<MyRow key={row[primaryKey]} row={row} rowDefinition={rowDefinition} />))}
    </TableContainer>
  )
}

interface Sort<K extends string> {
  sortBy: K | undefined
  direction: Direction
  change: (ch: { kind: 'sortBy'; sortBy: K | undefined }) => void
}
export function TableSortHeader<K extends string>({
  children,
  filters,
  sortBy,
  sx,
}: React.PropsWithChildren<{ filters: Sort<K>; sortBy: K | undefined; sx?: SxStyleProp }>) {
  return (
    <>
      <Button
        sx={{
          visibility: ['hidden', 'visible'],
          display: ['none', 'flex'],
          alignItems: 'center',
          ...sx,
        }}
        variant="tableHeader"
        onClick={() => filters.change({ kind: 'sortBy', sortBy })}
      >
        <Box sx={{ whiteSpace: 'nowrap' }}>{children}</Box>
        <Box>
          <Icon
            sx={{ ml: 1, display: 'flex', width: 1 }}
            size={12}
            name={
              filters.direction === 'ASC' && filters.sortBy === sortBy
                ? 'chevron_up'
                : 'chevron_down'
            }
            color={
              filters.direction !== undefined && filters.sortBy === sortBy
                ? 'primary'
                : 'text.muted'
            }
          />
        </Box>
      </Button>
      <Text sx={{ display: ['block', 'none'] }} variant="tableHead">
        {children}
      </Text>
    </>
  )
}
