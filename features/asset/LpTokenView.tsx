import { Icon } from '@makerdao/dai-ui-icons'
import { useAppContext } from 'components/AppContextProvider'
import { AppLink } from 'components/Links'
import { ProductCardBorrow } from 'components/ProductCardBorrow'
import { WithArrow } from 'components/WithArrow'
import { AssetPageContent } from 'content/assets'
import { AppSpinner, WithLoadingIndicator } from 'helpers/AppSpinner'
import { WithErrorHandler } from 'helpers/errorHandlers/WithErrorHandler'
import { useObservableWithError } from 'helpers/observableHook'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Box, Flex, Grid, Heading, Text } from 'theme-ui'

import { uniLpProductCards } from '../../helpers/productCards'

function Cards() {
  const { productCardsData$ } = useAppContext()
  const { error: productCardsDataError, value: productCardsDataValue } = useObservableWithError(
    productCardsData$,
  )

  return (
    <WithErrorHandler error={[productCardsDataError]}>
      <WithLoadingIndicator
        value={[productCardsDataValue]}
        customLoader={
          <Flex sx={{ alignItems: 'flex-start', justifyContent: 'center', height: '500px' }}>
            <AppSpinner sx={{ mt: 5 }} variant="styles.spinner.large" />
          </Flex>
        }
      >
        {([productCardsData]) => (
          <Grid columns={[1, 2, 3]}>
            {uniLpProductCards(productCardsData).map((cardData) => (
              <ProductCardBorrow cardData={cardData} />
            ))}
          </Grid>
        )}
      </WithLoadingIndicator>
    </WithErrorHandler>
  )
}
export function LpAssetsView({ content }: { content: AssetPageContent }) {
  const { t } = useTranslation()

  return (
    <Grid sx={{ zIndex: 1, width: '100%' }}>
      <Flex sx={{ justifyContent: 'center', alignItems: 'baseline' }}>
        <Icon name={content.icon} size="44px" sx={{ mr: 2, alignSelf: 'center' }} />
        <Heading variant="header1">{content.header}</Heading>
        <Heading sx={{ ml: 2 }} variant="header3">
          ({content.symbol})
        </Heading>
      </Flex>
      <Grid></Grid>
      <Flex sx={{ justifyContent: 'center', mb: 5 }}>
        <Box sx={{ textAlign: 'center', maxWidth: 900 }}>
          <Text sx={{ display: 'inline', color: 'text.subtitle' }} variant="paragraph1">
            {t(content.descriptionKey)}
          </Text>
          <AppLink href={content.link}>
            <WithArrow sx={{ display: 'inline', color: 'link', ml: 2 }}>
              <Text sx={{ display: 'inline', color: 'link' }} variant="paragraph1">
                {t('learn-more')}
              </Text>
            </WithArrow>
          </AppLink>
        </Box>
      </Flex>
      <Grid>
        <Cards />
      </Grid>
    </Grid>
  )
}
