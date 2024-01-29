import { usePreloadAppDataContext } from 'components/context/PreloadAppDataContextProvider'
import { MarketingTemplateInfoBox } from 'features/marketing-layouts/components'
import type {
  MarketingTemplatePalette,
  MarketingTemplateProductFinderBlocks,
} from 'features/marketing-layouts/types'
import { ProductHubPromoCardsList } from 'features/productHub/components/ProductHubPromoCardsList'
import { getGenericPromoCard } from 'features/productHub/helpers'
import { ProductHubView } from 'features/productHub/views'
import { type FC } from 'react'
import { Flex } from 'theme-ui'

type MarketingTemplateBlockViewProps = {
  block: MarketingTemplateProductFinderBlocks
  palette: MarketingTemplatePalette
}

export const MarketingTemplateBlockView: FC<MarketingTemplateBlockViewProps> = ({
  block,
  palette: { foreground },
}) => {
  const {
    productHub: { table },
  } = usePreloadAppDataContext()

  const { type } = block

  switch (type) {
    case 'info-box':
      return (
        <Flex sx={{ flexDirection: 'column', rowGap: 6 }}>
          {block.content.map((infoBox, i) => (
            <MarketingTemplateInfoBox key={i} {...infoBox} />
          ))}
        </Flex>
      )
    case 'product-finder':
      const promoCards = table
        .filter((product) =>
          block.content.promoCards.some(
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
            {...block.content}
          />
          <ProductHubPromoCardsList promoCards={promoCards} />
        </>
      )
  }
}
