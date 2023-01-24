import { Icon } from '@makerdao/dai-ui-icons'
import { TokenConfig } from 'blockchain/tokensMetadata'
import { AaveContextProvider, isAaveContextAvailable } from 'features/aave/AaveContextProvider'
import React, { useState } from 'react'
import { Box, Button, Flex, Text } from 'theme-ui'

import { WithLoadingIndicator } from '../../helpers/AppSpinner'
import { WithErrorHandler } from '../../helpers/errorHandlers/WithErrorHandler'
import { useObservable } from '../../helpers/observableHook'
import {
  ilkToEntryToken,
  IlkTokenMap,
  mapUrlFragmentToFilter,
  ProductCardData,
  ProductLandingPagesFilter,
  ProductLandingPagesFiltersKeys,
} from '../../helpers/productCards'
import { useAppContext } from '../AppContextProvider'
import { ProductCardMultiplyAave } from './ProductCardMultiplyAave'
import { ProductCardsSelect } from './ProductCardsSelect'
import { ProductCardsLoader, ProductCardsWrapper } from './ProductCardsWrapper'

interface ProductCardFilterProps {
  filters: Array<ProductLandingPagesFilter>
  makerProductCardComponent: (props: { cardData: ProductCardData }) => JSX.Element
  selectedFilter?: string
  filterCardsFunction: FilterCardsFunction
  otherStrategies: TokenConfig[]
}

type FilterCardsFunction = ({
  ilkToTokenMapping,
  cardsFilter,
}: {
  ilkToTokenMapping: Array<IlkTokenMap>
  cardsFilter?: ProductLandingPagesFiltersKeys
}) => Array<IlkTokenMap>

export function ProductCardsFilter({
  filters,
  makerProductCardComponent: ProductCardMakerComponent,
  selectedFilter,
  filterCardsFunction,
  otherStrategies,
}: ProductCardFilterProps) {
  const [currentFilter, setCurrentFilter] = useState(
    ((selectedFilter && mapUrlFragmentToFilter(selectedFilter)) || filters[0]).name,
  )
  const productsToDisplay = filterCardsFunction({
    ilkToTokenMapping: ilkToEntryToken,
    cardsFilter: currentFilter,
  })
  const { productCardsData$ } = useAppContext()
  const [productCardsData, productCardsDataError] = useObservable(
    productCardsData$(productsToDisplay.map(({ ilk }) => ilk)),
  )
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
      <AaveContextProvider>
        <WithErrorHandler error={[productCardsDataError]}>
          <WithLoadingIndicator
            value={[productCardsData, isAaveContextAvailable()]}
            customLoader={<ProductCardsLoader />}
          >
            {([_productCardsData]) => (
              <ProductCardsWrapper>
                {otherStrategies
                  .filter(({ protocol, name }) => {
                    return (
                      protocol === 'aave' &&
                      (name.toLocaleUpperCase().includes(currentFilter.toLocaleUpperCase()) ||
                        currentFilter.toLocaleUpperCase() === 'FEATURED')
                    )
                  })
                  .map((cardData) => (
                    <ProductCardMultiplyAave key={cardData.symbol} cardData={cardData} />
                  ))}
                {_productCardsData.map((cardData) => (
                  <ProductCardMakerComponent key={cardData.ilk} cardData={cardData} />
                ))}
              </ProductCardsWrapper>
            )}
          </WithLoadingIndicator>
        </WithErrorHandler>
      </AaveContextProvider>
    </>
  )
}
