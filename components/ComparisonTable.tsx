import { Icon } from 'components/Icon'
import type { FC, ReactNode } from 'react'
import React, { Fragment } from 'react'
import { checkmark, close } from 'theme/icons'
import type { ThemeUIStyleObject } from 'theme-ui'
import { Box, Flex, Grid } from 'theme-ui'

interface ComparisonTableIconProps {
  type: 'positive' | 'negative'
}

interface ComparisonTableProps {
  body: ReactNode[][]
  header: ReactNode[]
  columnHighlight?: {
    [key: number]: string | ThemeUIStyleObject
  }
}

const headerStyles: ThemeUIStyleObject = {
  position: 'relative',
  pb: '24px',
  color: 'neutral80',
  borderBottom: '1px solid',
  borderColor: 'neutral20',
  '&::before, &::after': {
    content: '""',
    position: 'absolute',
    bottom: '-1px',
    width: 4,
    height: '1px',
    background: 'neutral20',
  },
  '&::before': {
    left: '-32px',
  },
  '&::after': {
    right: '-32px',
  },
}

export const ComparisonTableIcon: FC<ComparisonTableIconProps> = ({ type }) => {
  return (
    <Flex
      sx={{
        display: 'inline-flex',
        width: '40px',
        height: '40px',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 'ellipse',
        bg: type === 'positive' ? 'interactive10' : 'critical10',
      }}
    >
      {type === 'positive' ? (
        <Icon icon={checkmark} color="interactive100" size="16px" />
      ) : (
        <Icon icon={close} color="critical100" size="12px" />
      )}
    </Flex>
  )
}

export const ComparisonTable: FC<ComparisonTableProps> = ({ body, columnHighlight, header }) => {
  const size = header.length - 1

  return (
    <Box sx={{}}>
      <Grid
        sx={{
          gridTemplateColumns: [
            `calc(50% - 8px) repeat(${size}, calc(50% - 8px))`,
            `calc(50% - 11px) repeat(${size}, calc(25% - 11px))`,
            `calc(50% - 8px) repeat(${size}, 1fr)`,
          ],
          alignItems: 'center',
          rowGap: 5,
          columnGap: 3,
          px: [0, null, 4],
          pb: 5,
          borderBottom: '1px solid',
          borderColor: 'neutral20',
          bg: 'neutral10',
          overflowX: 'auto',
        }}
      >
        {[...[header], ...body].map((column, i) => (
          <Fragment key={i}>
            <Box
              variant={i === 0 ? 'text.header5' : 'text.boldParagraph1'}
              sx={{
                ...(i === 0 && headerStyles),
                position: 'sticky',
                left: 0,
                bg: 'neutral10',
                zIndex: 1,
              }}
            >
              {column[0]}
            </Box>
            {column.slice(1, column.length).map((row, j) => (
              <Box
                key={j}
                variant="text.header5"
                sx={{
                  ...(i === 0 && headerStyles),
                  textAlign: 'center',
                  ...(columnHighlight &&
                    columnHighlight[j + 1] && {
                      ...(typeof columnHighlight[j + 1] === 'string'
                        ? { color: columnHighlight[j + 1] }
                        : { ...(columnHighlight[j + 1] as ThemeUIStyleObject) }),
                    }),
                }}
              >
                {typeof row === 'boolean' ? (
                  <ComparisonTableIcon type={row ? 'positive' : 'negative'} />
                ) : (
                  row
                )}
              </Box>
            ))}
          </Fragment>
        ))}
      </Grid>
    </Box>
  )
}
