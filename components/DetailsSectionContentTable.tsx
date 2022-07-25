import React, { useMemo, useState } from 'react'
import ReactSelect from 'react-select'
import { oasisBaseTheme } from 'theme'
import { Box, Card, Flex, Grid, Text } from 'theme-ui'
import { useMediaQuery } from 'usehooks-ts'

import { ChevronUpDown } from './ChevronUpDown'
import { SelectComponents } from 'react-select/src/components'

interface ContentTableProps {
  headers: string[]
  rows: string[][]
  footnote?: string | JSX.Element
}

interface TableHeaderOption {
  label: string
}

export function DetailsSectionContentTable({ headers, rows, footnote }: ContentTableProps) {
  const mobileHeaders = headers.slice(1).map((header) => ({ label: header }))
  const defaultMobileHeader = mobileHeaders[0]
  const [selectedMobileHeader, setSelectedMobileHeader] = useState<TableHeaderOption>(
    defaultMobileHeader,
  )
  const isMobileView = useMediaQuery(`(max-width: ${oasisBaseTheme?.breakpoints[0]})`)

  const selectedMobileHeaderIndex = headers.indexOf(selectedMobileHeader.label || '')
  const visibleMobileRow = rows.map((row) =>
    row.filter((_, index) => index === 0 || selectedMobileHeaderIndex === index),
  )

  const assetsSelectComponents = useMemo(() => reactSelectCustomComponents<TableHeaderOption>(), [])

  return (
    <Grid
      sx={{
        gridTemplateColumns: ['1fr 1fr', '2fr 1fr 1fr'],
      }}
    >
      {isMobileView && (
        <>
          <Text
            as="p"
            color="neutral80"
            sx={{ fontWeight: 'semiBold', textAlign: 'left' }}
            variant="paragraph4"
          >
            {headers[0]}
          </Text>
          <ReactSelect<TableHeaderOption>
            options={mobileHeaders}
            isSearchable={false}
            value={selectedMobileHeader}
            onChange={(value) => {
              setSelectedMobileHeader(value as TableHeaderOption)
            }}
            components={assetsSelectComponents}
          />
        </>
      )}
      {!isMobileView &&
        headers.map((header, index) => (
          <Text
            key={`${header}-${index}`}
            as="p"
            color="neutral80"
            sx={{ fontWeight: 'semiBold', textAlign: index === 0 ? 'left' : 'right' }}
            variant="paragraph4"
          >
            {header}
          </Text>
        ))}
      {(isMobileView ? visibleMobileRow : rows).map((row) =>
        row.map((rowItem, index) => (
          <Text
            key={`${rowItem}-${index}`}
            as="p"
            variant="paragraph3"
            sx={{ fontWeight: 'semiBold', textAlign: index === 0 ? 'left' : 'right' }}
          >
            {rowItem}
          </Text>
        )),
      )}
      {footnote && (
        <Box sx={{ gridColumn: '1/-1' }}>
          <Text variant="paragraph4" color="neutral80" sx={{ fontWeight: 'semiBold' }}>
            {footnote}
          </Text>
        </Box>
      )}
    </Grid>
  )
}

export const reactSelectCustomComponents = <T extends object>(): Partial<SelectComponents<T>> => ({
  IndicatorsContainer: () => null,
  ValueContainer: ({ children }) => <Flex>{children}</Flex>,
  SingleValue: ({ children }) => <Box>{children}</Box>,
  Option: ({ children, innerProps }) => (
    <Text
      {...innerProps}
      variant="paragraph4"
      sx={{
        py: 2,
        px: 3,
        cursor: 'pointer',
        '&:hover': {
          bg: 'secondary60',
        },
      }}
    >
      {children}
    </Text>
  ),
  Menu: ({ innerProps, children }) => (
    <Card
      {...innerProps}
      sx={{
        position: 'absolute',
        p: 0,
        py: 2,
        overflow: 'hidden',
        bottom: 0,

        transform: `translateY(calc(100%))`,
        boxShadow: 'cardLanding',
        left: 0,
        width: '100%',
        zIndex: 1,
      }}
    >
      {children}
    </Card>
  ),
  MenuList: ({ children }) => <Box sx={{ textAlign: 'left' }}>{children}</Box>,
  Control: ({ innerProps, children, selectProps: { menuIsOpen } }) => (
    <Text
      {...innerProps}
      variant="paragraph4"
      sx={{
        variant: 'cards.primary',
        cursor: 'pointer',
        display: 'flex',
        py: 2,
        mb: 3,
        pr: 0,
        border: 'none',
        justifyContent: 'flex-end',
        alignItems: 'center',
        fontWeight: 'semiBold',
        color: 'neutral80',
      }}
    >
      {children}
      <ChevronUpDown
        isUp={!!menuIsOpen}
        variant="select"
        size="auto"
        width="14px"
        height="9px"
        sx={{ color: 'neutral80', ml: 3 }}
      />
    </Text>
  ),
})
