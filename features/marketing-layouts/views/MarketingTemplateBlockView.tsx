import { usePreloadAppDataContext } from 'components/context/PreloadAppDataContextProvider'
import { SimpleCarousel } from 'components/SimpleCarousel'
import {
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
import { ProductHubPromoCardsList } from 'features/productHub/components/ProductHubPromoCardsList'
import { getGenericPromoCard } from 'features/productHub/helpers'
import { ProductHubView } from 'features/productHub/views'
import { type FC } from 'react'
import React from 'react'
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
  const {
    productHub: { table },
  } = usePreloadAppDataContext()

  const { background, foreground } = palette

  switch (type) {
    case 'benefit-box':
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
    case 'info-box':
      return (
        <Flex sx={{ flexDirection: 'column', rowGap: 6 }}>
          {content.map((infoBox, i) => (
            <MarketingTemplateInfoBox key={i} {...infoBox} />
          ))}
        </Flex>
      )
    case 'product-box':
      return (
        <Grid
          sx={{
            gap: 3,
            gridTemplateColumns: ['100%', 'unset'],
            gridTemplateAreas: ['unset', getGridTemplateAreas(content)],
          }}
        >
          {content.map((productBox, i) => (
            <MarketingTemplateProductBox
              key={i}
              background={background}
              index={i}
              {...productBox}
            />
          ))}
        </Grid>
      )
    case 'product-finder':
      const promoCards = table
        .filter((product) =>
          content.promoCards.some(
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
        <>
          <ProductHubView
            headerGradient={foreground}
            promoCardsCollection="Home"
            promoCardsPosition="none"
            limitRows={10}
            {...content}
          />
          <ProductHubPromoCardsList promoCards={promoCards} />
        </>
      )
  }
}
