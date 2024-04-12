import { ComparisonTable } from 'components/ComparisonTable'
import { SimpleCarousel } from 'components/SimpleCarousel'
import {
  MarketingTemplateBanner,
  MarketingTemplateBenefitBox,
  MarketingTemplateHeading,
  MarketingTemplateInfoBox,
  MarketingTemplateProductBox,
} from 'features/marketing-layouts/components'
import { getGridTemplateAreas, renderCssGradient } from 'features/marketing-layouts/helpers'
import type {
  MarketingTemplatePalette,
  MarketingTemplateProductFinderBlocks,
} from 'features/marketing-layouts/types'
import { MarketingTemplateBlocks } from 'features/marketing-layouts/types'
import { ProductHubView } from 'features/productHub/views'
import { getGradientColor } from 'helpers/getGradientColor'
import { type FC, Fragment } from 'react'
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
          {content.map(({ highlightedColumn, ...comparisonTable }, i) => (
            <ComparisonTable
              key={i}
              {...comparisonTable}
              {...(highlightedColumn && {
                columnHighlight: {
                  [highlightedColumn]: getGradientColor(renderCssGradient('90deg', foreground)),
                },
              })}
            />
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
            return (
              <Fragment key={i}>
                <ProductHubView headerGradient={foreground} limitRows={10} {...productFinder} />
              </Fragment>
            )
          })}
        </Flex>
      )
  }
}
