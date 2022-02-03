import { Icon } from '@makerdao/dai-ui-icons'
import { useAppContext } from 'components/AppContextProvider'
import { AppLink } from 'components/Links'
import { ProductCardBorrow } from 'components/ProductCardBorrow'
import { ProductCardMultiply } from 'components/ProductCardMultiply'
import { ProductCardsWrapper } from 'components/ProductCardsWrapper'
import { TabSwitcher } from 'components/TabSwitcher'
import { WithArrow } from 'components/WithArrow'
import { AssetPageContent } from 'content/assets'
import { AppSpinner, WithLoadingIndicator } from 'helpers/AppSpinner'
import { WithErrorHandler } from 'helpers/errorHandlers/WithErrorHandler'
import { useObservableWithError } from 'helpers/observableHook'
import { ProductCardData } from 'helpers/productCards'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Box, Flex, Grid, Heading, Text } from 'theme-ui'

function Loader() {
  return (
    <Flex sx={{ alignItems: 'flex-start', justifyContent: 'center', height: '500px' }}>
      <AppSpinner sx={{ mt: 5 }} variant="styles.spinner.large" />
    </Flex>
  )
}

function TabContent(props: {
  type: 'borrow' | 'multiply' | 'earn'
  renderProductCard: (props: { cardData: ProductCardData }) => JSX.Element
  ilks: string[]
  productCardsData: ProductCardData[]
}) {
  const ProductCard = props.renderProductCard
  const filteredCards = props.ilks
    .map((ilk) => props.productCardsData.find((card) => card.ilk === ilk))
    .filter(
      (cardData: ProductCardData | undefined): cardData is ProductCardData => cardData !== null,
    )

  return (
    <ProductCardsWrapper>
      {filteredCards.map((cardData) => (
        <ProductCard cardData={cardData} key={cardData.ilk} />
      ))}
    </ProductCardsWrapper>
  )
}
export function AssetView({ content }: { content: AssetPageContent }) {
  const { t } = useTranslation()

  const { productCardsData$ } = useAppContext()
  const { error: productCardsDataError, value: productCardsDataValue } = useObservableWithError(
    productCardsData$,
  )

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
          <WithLoadingIndicator value={[productCardsDataValue]} customLoader={<Loader />}>
            {([productCardsData]) => {
              return (
                <TabSwitcher
                  narrowTabsSx={{
                    display: ['block', 'none'],
                    maxWidth: '343px',
                    width: '100%',
                    mb: 4,
                  }}
                  wideTabsSx={{ display: ['none', 'block'], mb: 5 }}
                  tabs={[
                    {
                      tabLabel: t('landing.tabs.multiply.tabLabel'),
                      tabContent: (
                        <TabContent
                          ilks={content.ilks ? content.ilks : content.multiplyIlks}
                          type="multiply"
                          renderProductCard={ProductCardMultiply}
                          productCardsData={productCardsData}
                        />
                      ),
                    },
                    {
                      tabLabel: t('landing.tabs.borrow.tabLabel'),
                      tabContent: (
                        <TabContent
                          ilks={content.ilks ? content.ilks : content.borrowIlks}
                          type="borrow"
                          renderProductCard={ProductCardBorrow}
                          productCardsData={productCardsData}
                        />
                      ),
                    },
                  ]}
                />
              )
            }}
          </WithLoadingIndicator>
        </WithErrorHandler>
      </Grid>
    </Grid>
  )
}
