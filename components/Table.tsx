import React, { ReactNode } from 'react'
import { Box, Container, SxStyleProp } from 'theme-ui'

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
      <Box sx={{ width: '100%' }} as="tbody">{children}</Box>
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
      {data.map((row) => (
        <Row key={row[primaryKey]}>
          {rowDefinition.map(({ cell: Content, header }, idx) => (
            <Cell sx={{ display: ['flex', 'table-cell'], justifyContent: 'space-between' }} key={idx}>
              <Header sx={{ display: ['block', 'none'], padding: 0 }} >{header}</Header>
              <Content {...row} />
            </Cell>
          ))}
        </Row>
      ))}
    </TableContainer>
  )
}
