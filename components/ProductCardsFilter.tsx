import { Icon } from '@makerdao/dai-ui-icons'
import React, { ReactNode, useState } from 'react'
import { Box, Button, Flex, Text } from 'theme-ui'

import { ProductLandingPagesFilter, ProductLandingPagesFiltersKeys } from '../helpers/productCards'
import { ProductCardsSelect } from './ProductCardsSelect'

interface TokenTabsProps {
  filters: Array<ProductLandingPagesFilter>
  children: (token: ProductLandingPagesFiltersKeys) => ReactNode
}

export function ProductCardsFilter({ filters, children }: TokenTabsProps) {
  const [currentFilter, setCurrentFilter] = useState(filters[0].name)
  const [hover, setHover] = useState('')

  function handleTabClick(token: ProductLandingPagesFiltersKeys) {
    setCurrentFilter(token)
  }

  function handleSelectChange(filter: ProductLandingPagesFiltersKeys) {
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
