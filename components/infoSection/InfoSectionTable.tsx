import { Skeleton } from 'components/Skeleton'
import type { ReactNode } from 'react'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { ThemeUIStyleObject } from 'theme-ui'
import { Box, Button, Grid, Text } from 'theme-ui'

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
  const { t } = useTranslation()
  const [limitItems, setLimitItems] =
    useState<InfoSectionTableProps['defaultLimitItems']>(defaultLimitItems)
  const defaultLoadingItems = typeof defaultLimitItems === 'number' ? defaultLimitItems : 3
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
      {loading &&
        (!rows || rows.length === 0) &&
        new Array(defaultLoadingItems).fill(0).map((_, index) => (
          <Grid
            as="li"
            key={`InfoSectionTable_${title}_${index}`}
            columns={headers?.length}
            sx={{ listStyle: 'none' }}
          >
            {headers?.map((_, cellIndex) => (
              <Skeleton
                key={`InfoSectionTable_${title}_${index}_${cellIndex}`}
                sx={{ width: '80%', height: '35px' }}
              />
            ))}
          </Grid>
        ))}
      {!loading && rows && (rows.length === 0 || !rows) && (
        <Grid as="li" columns={1} sx={{ listStyle: 'none', textAlign: 'center', mt: 4 }}>
          <Text variant="paragraph3" color="neutral80">
            {t('system.no-data-to-display')}
          </Text>
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
      {expandItemsButtonLabel && !loading && limitItems !== 'all' && (
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
      {expandItemsButtonLabel && !loading && limitItems === 'all' && (
        <Box as="li" sx={{ listStyle: 'none' }}>
          <Button
            variant="textual"
            sx={{ fontSize: '12px', color: 'interactive100', cursor: 'pointer', width: '100%' }}
            onClick={() => setLimitItems(defaultLimitItems)}
          >
            Collapse
          </Button>
        </Box>
      )}
      {expandItemsButtonLabel && loading && (
        <Box as="li" sx={{ listStyle: 'none', mt: 3 }}>
          <Skeleton color="interactive" sx={{ width: '50%', height: '15px', margin: '0 auto' }} />
        </Box>
      )}
    </Grid>
  )
}
