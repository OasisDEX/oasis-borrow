import { Icon } from '@makerdao/dai-ui-icons'
import React, { ReactNode, useState } from 'react'
import { Box, Button, Flex, Text } from 'theme-ui'

import {
  ilkToEntryToken,
  mapUrlFragmentToFilter,
  ProductCardData,
  ProductLandingPagesFilter,
  ProductLandingPagesFiltersKeys,
} from '../helpers/productCards'
import { ProductCardsSelect } from './ProductCardsSelect'
import { useAppContext } from './AppContextProvider'
import { useObservable } from '../helpers/observableHook'
import { AppSpinner, WithLoadingIndicator } from '../helpers/AppSpinner'
import { WithErrorHandler } from '../helpers/errorHandlers/WithErrorHandler'
import { ProductCardBorrow } from './ProductCardBorrow'
import { ProductCardsWrapper } from './ProductCardsWrapper'

interface TokenTabsProps {
  filters: Array<ProductLandingPagesFilter>
  productCardComponent: (props: { cardData: ProductCardData }) => JSX.Element
  selectedFilter?: string
  filterCards: ({
    ilkToTokenMapping,
    cardsFilter,
  }: {
    ilkToTokenMapping: Array<{ ilk: string; token: string }>
    cardsFilter?: ProductLandingPagesFiltersKeys
  }) => Array<{ ilk: string; token: string }>
}

export function ProductCardsFilter({
  filters,
  productCardComponent,
  selectedFilter,
  filterCards,
}: TokenTabsProps) {
  const [currentFilter, setCurrentFilter] = useState(
    ((selectedFilter && mapUrlFragmentToFilter(selectedFilter)) || filters[0]).name,
  )
  const productsToDisplay = filterCards({
    ilkToTokenMapping: ilkToEntryToken,
    cardsFilter: currentFilter,
  })
  const { productCardsDataNew$ } = useAppContext()
  const [productCardsData, productCardsDataError] = useObservable(
    productCardsDataNew$(productsToDisplay.map(({ ilk }) => ilk)),
  )
  const [hover, setHover] = useState('')
  const ProductCardComponent = productCardComponent
  function handleTabClick(token: ProductLandingPagesFiltersKeys) {
    setCurrentFilter(token)
  }

  console.log(`currentFilter ${currentFilter}`)
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
                          ? 'primary100'
                          : 'neutral80',
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
      <WithErrorHandler error={[productCardsDataError]}>
        <WithLoadingIndicator
          value={[productCardsData]}
          customLoader={
            <Flex sx={{ alignItems: 'flex-start', justifyContent: 'center', height: '500px' }}>
              <AppSpinner sx={{ mt: 5 }} variant="styles.spinner.large" />
            </Flex>
          }
        >
          {([productCardsData]) => (
            <ProductCardsWrapper>
              {productCardsData.map((cardData) => (
                <ProductCardComponent cardData={cardData} key={cardData.ilk} />
              ))}
            </ProductCardsWrapper>
          )}
        </WithLoadingIndicator>
      </WithErrorHandler>
    </>
  )
}
