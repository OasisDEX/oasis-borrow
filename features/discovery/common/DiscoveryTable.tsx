import { getDiscoveryTableCellContent } from 'features/discovery/helpers'
import { DiscoveryTableRowData } from 'features/discovery/types'
import { camelToKebab } from 'helpers/camelToKebab'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Box, Text } from 'theme-ui'

export function DiscoveryTable({ rows }: { rows: DiscoveryTableRowData[] }) {
  const { t } = useTranslation()

  return (
    <Box
      sx={{
        position: 'relative',
        px: 4,
        pb: 1,
        borderTop: '1px solid',
        borderTopColor: 'neutral20',
        ...(rows.length > 0 && {
          '&::before': {
            content: '""',
            position: 'absolute',
            top: '52px',
            left: 0,
            right: 0,
            height: '1px',
            backgroundColor: 'neutral20',
          },
        }),
      }}
    >
      {rows.length > 0 ? (
        <Box as="table" sx={{ width: '100%', borderSpacing: '0 20px' }}>
          <Box as="thead" sx={{}}>
            <Box as="tr">
              {Object.keys(rows[0]).map((key) => (
                <Box
                  as="th"
                  key={key}
                  sx={{
                    px: '12px',
                    pb: '20px',
                    fontSize: 1,
                    fontWeight: 'semiBold',
                    color: 'neutral80',
                    lineHeight: '10px',
                    textAlign: 'right',
                    '&:first-child': {
                      textAlign: 'left',
                    },
                  }}
                >
                  {t(`discovery.table.header.${camelToKebab(key)}`)}
                </Box>
              ))}
            </Box>
          </Box>
          <Box as="tbody" sx={{ borderSpacing: '12px 0' }}>
            {rows.map((row, i) => (
              <Box
                as="tr"
                key={i}
                sx={{
                  borderRadius: 'medium',
                  transition: 'box-shadow 200ms',
                  '&:hover': {
                    boxShadow: 'buttonMenu',
                  },
                }}
              >
                {Object.keys(row).map((key) => (
                  <Box
                    as="td"
                    key={`${key}-${i}`}
                    sx={{
                      p: '8px 12px',
                      textAlign: 'right',
                      '&:first-child': {
                        textAlign: 'left',
                      },
                    }}
                  >
                    {getDiscoveryTableCellContent({ key, row })}
                  </Box>
                ))}
              </Box>
            ))}
          </Box>
        </Box>
      ) : (
        <Text as="p" variant="paragraph2" sx={{ py: 4 }}>
          {t('discovery.table.no-entries')}
        </Text>
      )}
    </Box>
  )
}
