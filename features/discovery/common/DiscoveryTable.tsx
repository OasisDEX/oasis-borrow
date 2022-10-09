import { getDiscoveryTableCellContent } from 'features/discovery/helpers'
import { DiscoveryTableRowData } from 'features/discovery/types'
import React from 'react'
import { Box } from 'theme-ui'

export function DiscoveryTable({ rows }: { rows: DiscoveryTableRowData[] }) {
  return (
    <>
      {rows.length > 0 ? (
        <Box as="table" sx={{ width: '100%', borderSpacing: '0 20px' }}>
          <Box as="thead">
            <Box as="tr">
              {Object.keys(rows[0]).map((key) => (
                <Box
                  as="th"
                  key={key}
                  sx={{
                    px: '12px',
                    fontSize: 2,
                    fontWeight: 'semiBold',
                    color: 'neutral80',
                    textAlign: 'right',
                    '&:first-child': {
                      textAlign: 'left',
                    },
                  }}
                >
                  {key}
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
        <Box>No data</Box>
      )}
    </>
  )
}
