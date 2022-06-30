import { Icon } from '@makerdao/dai-ui-icons'
import { useAppContext } from 'components/AppContextProvider'
import { AppLink } from 'components/Links'
import { ProductCardBorrow } from 'components/ProductCardBorrow'
import { ProductCardMultiply } from 'components/ProductCardMultiply'
import { ProductCardsWrapper } from 'components/ProductCardsWrapper'
import { TabBar, TabSection } from 'components/TabBar'
import { WithArrow } from 'components/WithArrow'
import { AssetPageContent } from 'content/assets'
import { AppSpinner, WithLoadingIndicator } from 'helpers/AppSpinner'
import { WithErrorHandler } from 'helpers/errorHandlers/WithErrorHandler'
import { useObservable } from 'helpers/observableHook'
import { ProductCardData, ProductTypes } from 'helpers/productCards'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Box, Flex, Grid, Heading, Text } from 'theme-ui'

import { ProductCardEarn } from '../../components/ProductCardEarn'

function Loader() {
  return (
    <Flex sx={{ alignItems: 'flex-start', justifyContent: 'center', height: '500px' }}>
      <AppSpinner sx={{ mt: 5 }} variant="styles.spinner.large" />
    </Flex>
  )
}

function TabContent(props: {
  type: ProductTypes
  renderProductCard: (props: { cardData: ProductCardData }) => JSX.Element
  ilks: string[]
  productCardsData: ProductCardData[]
}) {
  const ProductCard = props.renderProductCard
  const filteredCards = props.ilks
    .map((ilk) => props.productCardsData.find((card) => card.ilk === ilk))
    .filter(
      (cardData: ProductCardData | undefined): cardData is ProductCardData =>
        cardData !== null && cardData !== undefined,
    )

  return (
    <Box mt={5}>
      <ProductCardsWrapper>
        {filteredCards.map((cardData) => (
          <ProductCard cardData={cardData} key={cardData.ilk} />
        ))}
      </ProductCardsWrapper>
    </Box>
  )
}
export function AssetView({ content }: { content: AssetPageContent }) {
  const { t } = useTranslation()
  const { productCardsData$ } = useAppContext()
  const [productCardsData, productCardsDataError] = useObservable(productCardsData$)

  const tabs = (productCardsData: ProductCardData[]) => {
    const borrowTab = content.borrowIlks && {
      label: t('landing.tabs.borrow.tabLabel'),
      value: 'borrow',
      content: (
        <TabContent
          ilks={content.borrowIlks}
          type="borrow"
          renderProductCard={ProductCardBorrow}
          productCardsData={productCardsData}
        />
      ),
    }

    const multiplyTab = content.multiplyIlks && {
      label: t('landing.tabs.multiply.tabLabel'),
      value: 'multiply',
      content: (
        <TabContent
          ilks={content.multiplyIlks}
          type="multiply"
          renderProductCard={ProductCardMultiply}
          productCardsData={productCardsData}
        />
      ),
    }

    const earnTab = content.earnIlks && {
      label: t('landing.tabs.earn.tabLabel'),
      value: 'earn',
      content: (
        <TabContent
          ilks={content.earnIlks}
          type="earn"
          renderProductCard={ProductCardEarn}
          productCardsData={productCardsData}
        />
      ),
    }

    return [borrowTab, multiplyTab, earnTab].filter((tab) => tab) as TabSection[]
  }

  return (
    <Grid sx={{ zIndex: 1, width: '100%', mt: 4 }}>
      <Flex sx={{ justifyContent: 'center', alignItems: 'baseline' }}>
        <Icon name={content.icon} size="64px" sx={{ mr: 2, alignSelf: 'center' }} />
        <Heading variant="header1">{content.header}</Heading>
        <Heading sx={{ ml: 2 }} variant="header3">
          ({content.symbol})
        </Heading>
      </Flex>
      <Flex sx={{ justifyContent: 'center' }}>
        <Box sx={{ textAlign: 'center', maxWidth: 980 }}>
          <Text sx={{ display: 'inline', color: 'text.subtitle' }} variant="paragraph1">
            {t(content.descriptionKey)}
          </Text>
          <AppLink href={t(content.link)}>
            <WithArrow sx={{ display: 'inline', color: 'link', ml: 2 }}>
              <Text sx={{ display: 'inline', color: 'link' }} variant="paragraph1">
                {t('learn-more-about')} {content.symbol}
              </Text>
            </WithArrow>
          </AppLink>
        </Box>
      </Flex>
      <Grid sx={{ flex: 1, position: 'relative', mt: 5, mb: '184px' }}>
        <WithErrorHandler error={[productCardsDataError]}>
          <WithLoadingIndicator value={[productCardsData]} customLoader={<Loader />}>
            {([productCardsData]) => {
              return (
                <TabBar useDropdownOnMobile variant="large" sections={tabs(productCardsData)} />
              )
            }}
          </WithLoadingIndicator>
        </WithErrorHandler>
      </Grid>
    </Grid>
  )
}
