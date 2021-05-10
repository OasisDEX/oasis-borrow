import { Icon } from '@makerdao/dai-ui-icons'
import { Direction } from 'helpers/form'
import { useRedirect } from 'helpers/useRedirect'
import { useTranslation } from 'next-i18next'
import React, { HTMLProps, memo, ReactNode, useCallback } from 'react'
import { Box, Button, Container, SxStyleProp } from 'theme-ui'

import { getIsInternalLink } from './Links'

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
  href?: string
  target?: string
  onClick?: (e: React.MouseEvent<any>) => void
}

function Row({
  children,
  sx,
  href,
  onClick,
}: React.PropsWithChildren<{ sx?: SxStyleProp } & RowProps>) {
  const { push } = useRedirect()

  const redirect = useCallback(() => {
    if (href !== undefined && getIsInternalLink(href)) {
      push(href)
    } else if (href !== undefined) {
      window.open(href, '_blank')
    }
  }, [href])

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
        cursor: href ? 'pointer' : 'initial',
        ...sx,
        ...(href
          ? {
              '&:hover': {
                boxShadow: ['table', 'table_hovered'],
                transform: ['none', 'scaleX(0.99)'],
              },
            }
          : {}),
      }}
      as="tr"
      onClick={(e: React.MouseEvent<HTMLDivElement>) => {
        if (onClick) onClick(e)
        redirect()
      }}
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
