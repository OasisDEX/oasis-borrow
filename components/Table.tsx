import { Direction } from 'helpers/form'
import { useTranslation } from 'next-i18next'
import React, { HTMLProps, memo, ReactNode } from 'react'
import { Box, Button, Container, SxStyleProp } from 'theme-ui'

import { ChevronUpDown } from './ChevronUpDown'

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
  noResults?: React.ReactNode
  deriveRowProps?: (row: T) => RowProps
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

interface RowProps {
  onClick?: () => void
}

function Row({ children, sx, onClick }: React.PropsWithChildren<{ sx?: SxStyleProp } & RowProps>) {
  return (
    <Box
      sx={{
        display: ['flex', 'table-row'],
        mb: 3,
        flexDirection: 'column',
        boxShadow: 'table',
        background: 'white',
        borderRadius: '8px',
        transition: `
          transform 0.2s ease-in-out,
          box-shadow 0.2s ease-in-out
          `,
        cursor: onClick ? 'pointer' : 'initial',
        ...sx,
        ...(onClick
          ? {
              '&:hover': {
                boxShadow: ['table', 'table_hovered'],
                transform: ['none', 'scaleX(0.99)'],
              },
            }
          : {}),
      }}
      as="tr"
      onClick={onClick}
    >
      {children}
    </Box>
  )
}

function Cell({
  children,
  sx,
  ...props
}: React.PropsWithChildren<{ sx?: SxStyleProp } & HTMLProps<HTMLTableCellElement>>) {
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
      {...props}
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
        color: 'neutral80',
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

const TableRow = memo(
  <T extends {}>({
    row,
    columns,
    rowProps,
  }: {
    row: T
    columns: ColumnDef<any, any>[]
    rowProps?: RowProps
  }) => {
    const { t } = useTranslation()

    return (
      <Row {...(rowProps || {})}>
        {columns.map(({ cell: Content, headerLabel }, idx) => (
          <Cell
            sx={{
              display: ['flex', 'table-cell'],
              justifyContent: 'space-between',
              ':before': {
                variant: 'text.paragraph2',
                fontWeight: 'semiBold',
                color: 'neutral80',
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
  },
)

export function Table<T extends Record<K, string>, K extends keyof T, S>({
  data,
  columns,
  primaryKey,
  state,
  noResults,
  deriveRowProps,
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
      {noResults && data.length === 0 ? (
        <Row sx={{ background: 'none' }}>
          <Cell colSpan={columns.length}>
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              {noResults}
            </Box>
          </Cell>
        </Row>
      ) : (
        data.map((row) => (
          <TableRow
            rowProps={deriveRowProps ? deriveRowProps(row) : undefined}
            key={row[primaryKey]}
            row={row}
            columns={columns}
          />
        ))
      )}
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
      <Box sx={{ whiteSpace: 'nowrap', color: isSelected ? 'primary100' : 'neutral80' }}>
        {children}
      </Box>
      <Box>
        <ChevronUpDown
          variant="sort"
          isUp={filters.direction === 'ASC' && isSelected}
          size={12}
          color={isSelected ? 'primary100' : 'neutral80'}
        />
      </Box>
    </Button>
  )
}
