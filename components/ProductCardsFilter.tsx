import { Icon } from '@makerdao/dai-ui-icons'
import React, { ReactNode, useState } from 'react'
import { Box, Button, Flex, Text } from 'theme-ui'

import { ProductCardsSelect } from './ProductCardsSelect'

interface TokenTabsProps {
  filters: { name: string; icon: string }[]
  children: (token: string) => ReactNode
}

export function ProductCardsFilter({ filters, children }: TokenTabsProps) {
  const [currentFilter, setCurrentFilter] = useState(filters[0].name)
  const [hover, setHover] = useState('')

  function handleTabClick(token: string) {
    setCurrentFilter(token)
  }

  function handleSelectChange(filter: string) {
    setCurrentFilter(filter)
  }

  function handleHover(filter: string) {
    setHover(filter)
  }

  return (
    <>
      <Box sx={{ display: ['none', 'block'] }}>
        <Flex sx={{ justifyContent: 'space-around', mb: 4 }}>
          {filters.map((tab) => {
            return (
              <Button variant="unStyled" onClick={() => handleTabClick(tab.name)} key={tab.name}>
                <Flex
                  sx={{ flexDirection: 'column', alignItems: 'center' }}
                  onMouseEnter={() => handleHover(tab.name)}
                  onMouseLeave={() => handleHover('')}
                >
                  <Icon
                    name={
                      tab.icon +
                      `_${tab.name === currentFilter || hover === tab.name ? 'color' : 'mono'}`
                    }
                    size="32px"
                    sx={{ verticalAlign: 'sub' }}
                  />
                  <Text
                    sx={{
                      variant: 'paragraph2',
                      fontWeight: 'semiBold',
                      color:
                        tab.name === currentFilter || hover === tab.name
                          ? 'primary'
                          : 'text.subtitle',
                    }}
                  >
                    {tab.name}
                  </Text>
                </Flex>
              </Button>
            )
          })}
        </Flex>
      </Box>
      <Flex sx={{ width: '100%', justifyContent: 'center', display: ['block', 'none'], mb: 3 }}>
        <ProductCardsSelect
          options={filters}
          handleChange={handleSelectChange}
          currentFilter={currentFilter}
        />
      </Flex>

      {children(currentFilter)}
    </>
  )
}
