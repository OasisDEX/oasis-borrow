import React, { type ReactNode, useMemo, useState } from 'react'
import ReactSelect from 'react-select'
import { theme } from 'theme'
import { Box, Card, Flex, Text } from 'theme-ui'
import { useMediaQuery } from 'usehooks-ts'

import { ChevronUpDown } from './ChevronUpDown'
import type { SelectComponents } from 'react-select/src/components'

interface ContentTableProps {
  headers: string[]
  rows: ReactNode[][]
  footnote?: string | JSX.Element
}

interface TableHeaderOption {
  label: string
}

export function DetailsSectionContentTable({ headers, rows, footnote }: ContentTableProps) {
  const mobileHeaders = headers.slice(1).map((header) => ({ label: header }))
  const defaultMobileHeader = mobileHeaders[0]
  const [selectedMobileHeader, setSelectedMobileHeader] =
    useState<TableHeaderOption>(defaultMobileHeader)
  const isMobileView = useMediaQuery(`(max-width: ${theme?.breakpoints[0]})`)

  const selectedMobileHeaderIndex = headers.indexOf(selectedMobileHeader.label || '')
  const visibleMobileRow = rows.map((row) =>
    row.filter((_, index) => index === 0 || selectedMobileHeaderIndex === index),
  )

  const assetsSelectComponents = useMemo(() => reactSelectCustomComponents<TableHeaderOption>(), [])

  return (
    <>
      {isMobileView && (
        <Flex sx={{ justifyContent: 'space-between' }}>
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
        </Flex>
      )}
      <Box as="table" sx={{ width: '100%', tableLayout: 'fixed', borderCollapse: 'collapse' }}>
        {!isMobileView && (
          <Box as="thead">
            <Box as="tr">
              {headers.map((header, index) => (
                <Box
                  key={`${header}-${index}`}
                  as="th"
                  variant="text.paragraph4"
                  sx={{
                    color: 'neutral80',
                    px: 3,
                    pb: 3,
                    textAlign: 'right',
                    '&:first-of-type': {
                      width: '50%',
                      pl: 0,
                      textAlign: 'left',
                    },
                    '&:last-of-type': {
                      pr: 0,
                    },
                  }}
                >
                  {header}
                </Box>
              ))}
            </Box>
          </Box>
        )}
        <Box as="tbody">
          {(isMobileView ? visibleMobileRow : rows).map((row, i) => (
            <Box as="tr" key={i}>
              {row.map((rowItem, j) => (
                <Box
                  as="td"
                  key={`${i}-${j}`}
                  variant="text.boldParagraph3"
                  sx={{
                    px: 3,
                    verticalAlign: 'top',
                    textAlign: 'right',
                    ...(i > 0 && {
                      pt: '12px',
                      borderTop: '1px solid',
                      borderTopColor: 'neutral20',
                    }),
                    ...(i + 1 < rows.length && {
                      pb: '12px',
                    }),
                    '&:first-of-type': {
                      pl: 0,
                      textAlign: 'left',
                    },
                    '&:last-of-type': {
                      pr: 0,
                    },
                  }}
                >
                  {rowItem}
                </Box>
              ))}
            </Box>
          ))}
        </Box>
      </Box>
      {footnote && (
        <Text as="p" variant="paragraph4" color="neutral80" sx={{ mt: 3 }}>
          {footnote}
        </Text>
      )}
    </>
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
