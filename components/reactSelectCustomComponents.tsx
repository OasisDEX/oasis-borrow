import React from 'react'
import { Box, Card, Flex } from 'theme-ui'

import { ChevronUpDown } from './ChevronUpDown'
import { SelectComponents } from 'react-select/src/components'

export const reactSelectCustomComponents = <T extends object>(): Partial<SelectComponents<T>> => ({
  IndicatorsContainer: () => null,
  ValueContainer: ({ children }) => (
    <Flex
      sx={{
        color: 'primary100',
        fontWeight: 'body',
        fontSize: '18px',
        backgroundColor: 'white',
      }}
    >
      {children}
    </Flex>
  ),
  SingleValue: ({ children }) => <Box>{children}</Box>,
  Option: ({ children, innerProps }) => (
    <Box
      {...innerProps}
      sx={{
        py: 2,
        px: 3,
        cursor: 'pointer',
        '&:hover': {
          bg: 'neutral30',
        },
      }}
    >
      {children}
    </Box>
  ),
  Menu: ({ innerProps, children }) => (
    <Card
      {...innerProps}
      sx={{
        boxShadow: 'selectMenu',
        borderRadius: 'medium',
        border: 'none',
        p: 0,
        position: 'absolute',
        top: '115%',
        width: '100%',
        zIndex: 2,
      }}
    >
      {children}
    </Card>
  ),
  Control: ({ innerProps, children, selectProps: { menuIsOpen } }) => (
    <Box
      {...innerProps}
      sx={{
        cursor: 'pointer',
        variant: 'links.nav',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: 3,
        border: '1px solid',
        borderColor: 'neutral60',
        borderRadius: 'medium',
        py: '8px',
        px: '16px',
        height: '52px',
        backgroundColor: 'white',
      }}
    >
      {children}
      <ChevronUpDown isUp={!!menuIsOpen} variant="select" size="auto" width="13.3px" />
    </Box>
  ),
})
