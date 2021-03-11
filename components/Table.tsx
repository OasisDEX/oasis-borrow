import { Icon } from '@makerdao/dai-ui-icons'
import { Direction } from 'helpers/form'
import { useTranslation } from 'i18n'
import React, { memo, ReactNode } from 'react'
import { Box, Button, Container, SxStyleProp } from 'theme-ui'

export interface ColumnDef<T, S> {
  headerLabel: string
  header: React.ComponentType<S & { label: string }>
  cell: React.ComponentType<T>
}

interface TableProps<T extends Record<K, string>, K extends keyof T, S> {
  data: T[]
  state: S
  columns: ColumnDef<T, S>[]
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

const TableRow = memo(({ row, columns }: { row: any; columns: ColumnDef<any, any>[] }) => {
  const { t } = useTranslation()
  return (
    <Row>
      {columns.map(({ cell: Content, headerLabel }, idx) => (
        <Cell
          sx={{
            display: ['flex', 'table-cell'],
            justifyContent: 'space-between',
            ':before': {
              variant: 'text.paragraph2',
              fontWeight: 'semiBold',
              color: 'text.muted',
              content: `"${t(headerLabel)}"`,
              display: ['block', 'none'],
            },
          }}
          key={idx}
        >
          <Content {...row} />
        </Cell>
      ))}
    </Row>
  )
})
export function Table<T extends Record<K, string>, K extends keyof T, S>({
  data,
  columns,
  primaryKey,
  state,
}: TableProps<T, K, S>) {
  const { t } = useTranslation()
  return (
    <TableContainer
      header={columns.map(({ header: HeaderComponent, headerLabel }) => (
        <Header key={headerLabel}>
          <HeaderComponent {...state} label={t(headerLabel)} />
        </Header>
      ))}
    >
      {data.map((row) => (
        <TableRow key={row[primaryKey]} row={row} columns={columns} />
      ))}
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
  const isSelected = filters.sortBy === sortBy
  return (
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
      <Box sx={{ whiteSpace: 'nowrap', color: isSelected ? 'primary' : 'text.muted' }}>
        {children}
      </Box>
      <Box>
        <Icon
          sx={{ ml: 1, display: 'flex', width: 1 }}
          size={12}
          name={filters.direction === 'ASC' && isSelected ? 'chevron_up' : 'chevron_down'}
          color={isSelected ? 'primary' : 'text.muted'}
        />
      </Box>
    </Button>
  )
}
