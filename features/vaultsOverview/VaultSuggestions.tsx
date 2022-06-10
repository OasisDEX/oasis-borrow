import uniqBy from 'lodash/uniqBy'
import { Trans, useTranslation } from 'next-i18next'
import React from 'react'
import { Box, Flex, Heading, Text } from 'theme-ui'

import { AppLink } from '../../components/Links'
import { ProductCardBorrow } from '../../components/ProductCardBorrow'
import { ProductCardEarn } from '../../components/ProductCardEarn'
import { ProductCardMultiply } from '../../components/ProductCardMultiply'
import { ProductCardsWrapper } from '../../components/ProductCardsWrapper'
import { TabSwitcher } from '../../components/TabSwitcher'
import { formatAddress } from '../../helpers/formatters/format'
import {
  borrowPageCardsData,
  cardFiltersFromBalances,
  earnPageCardsData,
  landingPageCardsData,
  multiplyPageCardsData,
  ProductCardData,
  ProductLandingPagesFiltersKeys,
  ProductTypes,
} from '../../helpers/productCards'
import { WithChildren } from '../../helpers/types'
import { useFeatureToggle } from '../../helpers/useFeatureToggle'
import { fadeInAnimation, slideInAnimation } from '../../theme/animations'

function filterCards(props: {
  productCardsData: ProductCardData[]
  cardFilters: ProductLandingPagesFiltersKeys[]
  type: ProductTypes
}) {
  const productCardsDataByVaultType = {
    borrow: borrowPageCardsData,
    multiply: multiplyPageCardsData,
    earn: earnPageCardsData,
  }

  const filterCardsDataByProduct = productCardsDataByVaultType[props.type]
    ? productCardsDataByVaultType[props.type]
    : productCardsDataByVaultType['multiply']

  return uniqBy(
    props.cardFilters.reduce((cards, filter) => {
      if (filter) {
        return cards.concat(
          filterCardsDataByProduct({
            productCardsData: props.productCardsData,
            cardsFilter: filter,
          }),
        )
      }
      return cards
    }, [] as ProductCardData[]),
    'ilk',
  )
}

function fallbackToFeaturedCards(props: {
  productCardsData: ProductCardData[]
  type: ProductTypes
}) {
  return landingPageCardsData({
    productCardsData: props.productCardsData,
    product: props.type,
  })
}

function TabContent(props: {
  type: ProductTypes
  renderProductCard: (props: { cardData: ProductCardData }) => JSX.Element
  productCardsData: ProductCardData[]
}) {
  const { productCardsData } = props
  const ProductCard = props.renderProductCard

  const balancedDerivedCardFilters = cardFiltersFromBalances(productCardsData)

  const hasFilters = balancedDerivedCardFilters.length > 0
  const filteredCards = hasFilters
    ? filterCards({ productCardsData, cardFilters: balancedDerivedCardFilters, type: props.type })
    : fallbackToFeaturedCards({ productCardsData, type: props.type })

  return (
    <Flex
      key={props.type}
      sx={{ flexDirection: 'column', mt: 5, alignItems: 'center', width: '100%' }}
    >
      <ProductCardsWrapper>
        {filteredCards.map((cardData) => (
          <ProductCard cardData={cardData} key={cardData.ilk} />
        ))}
      </ProductCardsWrapper>
    </Flex>
  )
}

function TabHeaderParagraph({ children }: WithChildren) {
  return (
    <Flex sx={{ flexDirection: 'column', alignItems: 'center' }}>
      <Box
        sx={{
          ...slideInAnimation,
        }}
      >
        <Text
          variant="paragraph2"
          sx={{
            mt: 2,
            color: 'lavender',
            maxWidth: 617,
            textAlign: 'center',
            mb: 4,
            ...fadeInAnimation,
          }}
        >
          {children}
        </Text>
      </Box>
    </Flex>
  )
}

export function VaultSuggestions(props: { productCardsData: ProductCardData[]; address: string }) {
  const { t } = useTranslation()
  const { productCardsData, address } = props
  const isEarnEnabled = useFeatureToggle('EarnProduct')

  return (
    <>
      <Heading variant="header2" mt={6} sx={{ textAlign: 'center', fontWeight: 'regular' }} as="h1">
        <Trans
          i18nKey="vaults-overview.headers.vault-suggestions"
          values={{ address: formatAddress(address) }}
          components={[<br />]}
        />
      </Heading>
      <TabSwitcher
        tabs={[
          {
            tabLabel: t('landing.tabs.multiply.tabLabel'),
            tabContent: (
              <TabContent
                type="multiply"
                renderProductCard={ProductCardMultiply}
                productCardsData={productCardsData}
              />
            ),
            tabHeaderPara: (
              <TabHeaderParagraph>
                {t('landing.tabs.multiply.tabParaContent')}{' '}
                <AppLink href="/multiply" variant="inText">
                  {t('landing.tabs.multiply.tabParaLinkContent')}
                </AppLink>
              </TabHeaderParagraph>
            ),
          },
          {
            tabLabel: t('landing.tabs.borrow.tabLabel'),
            tabContent: (
              <TabContent
                type="borrow"
                renderProductCard={ProductCardBorrow}
                productCardsData={productCardsData}
              />
            ),
            tabHeaderPara: (
              <TabHeaderParagraph>
                <Text as="p">{t('landing.tabs.borrow.tabParaContent')} </Text>
                <AppLink href="/borrow" variant="inText">
                  {t('landing.tabs.borrow.tabParaLinkContent')}
                </AppLink>
              </TabHeaderParagraph>
            ),
          },
          ...(isEarnEnabled
            ? [
                {
                  tabLabel: t('landing.tabs.earn.tabLabel'),
                  tabContent: (
                    <TabContent
                      type="earn"
                      renderProductCard={ProductCardEarn}
                      productCardsData={productCardsData}
                    />
                  ),
                  tabHeaderPara: (
                    <TabHeaderParagraph>
                      {t('landing.tabs.earn.tabParaContent')}{' '}
                      <AppLink href="/multiply" variant="inText">
                        {t('landing.tabs.earn.tabParaLinkContent')}
                      </AppLink>
                    </TabHeaderParagraph>
                  ),
                },
              ]
            : []),
        ]}
        narrowTabsSx={{
          display: ['block', 'none'],
          width: '100%',
        }}
        wideTabsSx={{ display: ['none', 'block'] }}
      />
    </>
  )
}
