import { AppSpinner } from 'helpers/AppSpinner'
import type { ReactNode } from 'react'
import React, { useState } from 'react'
import type { ThemeUIStyleObject } from 'theme-ui'
import { Box, Button, Flex, Grid, Text } from 'theme-ui'

interface InfoSectionTableProps {
  title?: ReactNode
  withListPadding?: boolean
  loading?: boolean
  headers?: string[]
  headersSx?: ThemeUIStyleObject
  rows?: (JSX.Element | string)[][]
  wrapperSx?: ThemeUIStyleObject
  defaultLimitItems?: number | 'all'
  expandItemsButtonLabel?: string
}

export function InfoSectionTable({
  title,
  withListPadding = true,
  headers,
  rows,
  headersSx,
  wrapperSx,
  defaultLimitItems = 'all',
  expandItemsButtonLabel,
  loading = false,
}: InfoSectionTableProps) {
  const [limitItems, setLimitItems] =
    useState<InfoSectionTableProps['defaultLimitItems']>(defaultLimitItems)
  return (
    <Grid
      as="ul"
      sx={{
        position: 'relative',
        p: withListPadding ? 3 : 0,
        backgroundColor: 'neutral30',
        borderRadius: 'medium',
        listStyle: 'none',
        opacity: loading ? 0.5 : 1,
        ...wrapperSx,
      }}
    >
      {loading && (
        <Flex
          sx={{ position: 'absolute', width: '100%', height: '100%', justifyContent: 'center' }}
        >
          <AppSpinner size={30} />
        </Flex>
      )}
      {title && (
        <Box as="li" sx={{ listStyle: 'none' }}>
          <Text as="h3" variant="paragraph3" sx={{ fontWeight: 'semiBold', mb: 2 }}>
            {title}
          </Text>
        </Box>
      )}
      {headers && (
        <Grid as="li" columns={headers.length} sx={{ listStyle: 'none' }}>
          {headers.map((header) => (
            <Text
              key={header}
              variant="paragraph4"
              sx={{ fontWeight: 'semiBold', color: 'neutral80', ...headersSx }}
            >
              {header}
            </Text>
          ))}
        </Grid>
      )}
      {rows &&
        rows
          .filter((_, itemIndex) => {
            if (limitItems === 'all') return true
            if (typeof limitItems === 'number') {
              return itemIndex < limitItems
            }
            return false
          })
          .map((row, index) => (
            <Grid
              as="li"
              key={`InfoSectionTable_${title}_${index}`}
              columns={row?.length}
              sx={{ listStyle: 'none' }}
            >
              {row?.map((cell, cellIndex) =>
                typeof cell === 'string' ? (
                  <Text
                    key={`InfoSectionTable_${title}_${index}_${cellIndex}`}
                    variant="paragraph4"
                    color="neutral80"
                    sx={{ fontSize: '11px' }}
                  >
                    {cell}
                  </Text>
                ) : (
                  <Box key={`InfoSectionTable_${title}_${index}_${cellIndex}`}>{cell}</Box>
                ),
              )}
            </Grid>
          ))}
      {expandItemsButtonLabel && limitItems !== 'all' && (
        <Box as="li" sx={{ listStyle: 'none' }}>
          <Button
            variant="textual"
            sx={{ fontSize: '12px', color: 'interactive100', cursor: 'pointer', width: '100%' }}
            onClick={() => setLimitItems('all')}
          >
            {expandItemsButtonLabel}
          </Button>
        </Box>
      )}
    </Grid>
  )
}
