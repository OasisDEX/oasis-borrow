import React from 'react'
import { Box, Card, Flex } from 'theme-ui'

import { ChevronUpDown } from './ChevronUpDown'
import { TabSection } from './TabBar'
import { VaultTabTag } from './vault/VaultTabTag'
import { SelectComponents } from 'react-select/src/components'

export const reactSelectCustomComponents = (): Partial<SelectComponents<TabSection>> => ({
  IndicatorsContainer: () => null,
  ValueContainer: ({ children }) => (
    <Flex
      sx={{
        color: 'primary',
        fontWeight: 'body',
        fontSize: '18px',
        backgroundColor: 'white',
      }}
    >
      {children}
    </Flex>
  ),
  SingleValue: ({ data, children }) => {
    return (
      <Flex sx={{ alignItems: 'center' }}>
        {data.label}
        {data.tag && <VaultTabTag isEnabled={data.tag.active} />}
        {children}
      </Flex>
    )
  },
  Option: ({ innerProps, isSelected, data }) => {
    return (
      <Box
        {...innerProps}
        sx={{
          py: 2,
          px: 3,
          bg: isSelected ? 'selected' : undefined,
          cursor: 'pointer',
          '&:hover': {
            bg: 'secondaryAlt',
          },
        }}
      >
        <Flex sx={{ fontWeight: isSelected ? 'semiBold' : 'body', alignItems: 'center' }}>
          {data.label}
          {data.tag && <VaultTabTag isEnabled={data.tag.active} />}
        </Flex>
      </Box>
    )
  },
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
        borderColor: '#ccc',
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
