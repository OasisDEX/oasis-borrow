import { ComparisonTable } from 'components/ComparisonTable'
import { usePreloadAppDataContext } from 'components/context/PreloadAppDataContextProvider'
import { Icon } from 'components/Icon'
import { SimpleCarousel } from 'components/SimpleCarousel'
import {
  MarketingTemplateBanner,
  MarketingTemplateBenefitBox,
  MarketingTemplateHeading,
  MarketingTemplateInfoBox,
  MarketingTemplateProductBox,
} from 'features/marketing-layouts/components'
import { getGridTemplateAreas } from 'features/marketing-layouts/helpers'
import type {
  MarketingTemplatePalette,
  MarketingTemplateProductFinderBlocks,
} from 'features/marketing-layouts/types'
import { MarketingTemplateBlocks } from 'features/marketing-layouts/types'
import { ProductHubPromoCardsList } from 'features/productHub/components/ProductHubPromoCardsList'
import { getGenericPromoCard } from 'features/productHub/helpers'
import { ProductHubView } from 'features/productHub/views'
import { useTranslation } from 'next-i18next'
import { type FC, Fragment } from 'react'
import React from 'react'
import { sparks } from 'theme/icons'
import { Box, Flex, Grid } from 'theme-ui'

type MarketingTemplateBlockViewProps = MarketingTemplateProductFinderBlocks & {
  palette: MarketingTemplatePalette
}

export const MarketingTemplateBlockView: FC<MarketingTemplateBlockViewProps> = ({
  content,
  description,
  palette,
  subtitle,
  title,
  type,
}) => {
  const { t } = useTranslation()
  const {
    productHub: { table },
  } = usePreloadAppDataContext()

  const { foreground } = palette

  switch (type) {
    case MarketingTemplateBlocks.BANNER:
      return (
        <Flex sx={{ flexDirection: 'column', rowGap: 4 }}>
          {content.map((banner, i) => (
            <MarketingTemplateBanner key={i} palette={palette} {...banner} />
          ))}
        </Flex>
      )
    case MarketingTemplateBlocks.BENEFIT_BOX:
      return (
        <SimpleCarousel
          header={
            <Box>
              <MarketingTemplateHeading
                palette={palette}
                description={description}
                subtitle={subtitle}
                title={title}
              />
            </Box>
          }
          slidesToDisplay={2}
          slidesToScroll={2}
          overflow="visible"
          slides={content.map((benefitBox, i) => (
            <MarketingTemplateBenefitBox key={i} {...benefitBox} />
          ))}
        />
      )
    case MarketingTemplateBlocks.COMPARISON_TABLE:
      return (
        <Flex sx={{ flexDirection: 'column', rowGap: 5 }}>
          {content.map((comparisonTable, i) => (
            <ComparisonTable key={i} {...comparisonTable} />
          ))}
        </Flex>
      )
    case MarketingTemplateBlocks.INFO_BOX:
      return (
        <Flex sx={{ flexDirection: 'column', rowGap: 6 }}>
          {content.map((infoBox, i) => (
            <MarketingTemplateInfoBox key={i} {...infoBox} />
          ))}
        </Flex>
      )
    case MarketingTemplateBlocks.PRODUCT_BOX:
      return (
        <Grid
          sx={{
            gap: 3,
            gridTemplateColumns: ['100%', '50% 50%'],
            gridTemplateAreas: ['unset', getGridTemplateAreas(content)],
          }}
        >
          {content.map((productBox, i) => (
            <MarketingTemplateProductBox key={i} index={i} palette={palette} {...productBox} />
          ))}
        </Grid>
      )
    case MarketingTemplateBlocks.PRODUCT_FINDER:
      return (
        <Flex sx={{ flexDirection: 'column' }}>
          {content.map((productFinder, i) => {
            const promoCards = table
              .filter((product) =>
                productFinder.promoCards.some(
                  (filters) =>
                    product.network === filters.network &&
                    product.protocol === filters.protocol &&
                    product.product.includes(filters.product) &&
                    product.primaryToken.toLowerCase() === filters.primaryToken.toLowerCase() &&
                    product.secondaryToken.toLowerCase() === filters.secondaryToken.toLowerCase(),
                ),
              )
              .map((product) => getGenericPromoCard({ product }))

            return (
              <Fragment key={i}>
                <ProductHubView
                  headerGradient={foreground}
                  promoCardsCollection="Home"
                  promoCardsPosition="none"
                  limitRows={10}
                  {...productFinder}
                />
                <ProductHubPromoCardsList
                  heading={
                    <>
                      <Icon icon={sparks} color={foreground[0]} size={18} sx={{ mr: 2 }} />
                      {t('product-hub.featured')}
                    </>
                  }
                  promoCards={promoCards}
                />
              </Fragment>
            )
          })}
        </Flex>
      )
  }
}
