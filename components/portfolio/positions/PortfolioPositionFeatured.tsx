import { usePreloadAppDataContext } from 'components/context/PreloadAppDataContextProvider'
import { Icon } from 'components/Icon'
import { PromoCard } from 'components/PromoCard'
import useEmblaCarousel from 'embla-carousel-react'
import { PROMO_CARD_COLLECTIONS_PARSERS } from 'handlers/product-hub/promo-cards'
import { useAppConfig } from 'helpers/config'
import { uniq } from 'lodash'
import React, { useState } from 'react'
import { chevron_left, chevron_right } from 'theme/icons'
import { Box, Button, Flex, Text } from 'theme-ui'

const SLIDES = 9

interface PortfolioPositionFeaturedProps {
  slidesToDisplay?: number
}

export const PortfolioPositionFeatured = ({
  slidesToDisplay = 2,
}: PortfolioPositionFeaturedProps) => {
  const {
    productHub: { table },
  } = usePreloadAppDataContext()
  const { AjnaSafetySwitch } = useAppConfig('features')
  const [emblaRef, emblaApi] = useEmblaCarousel({ slidesToScroll: slidesToDisplay })

  const [amount, setAmount] = useState<number>(slidesToDisplay)
  const promoCardsData =
    PROMO_CARD_COLLECTIONS_PARSERS[AjnaSafetySwitch ? 'Home' : 'HomeWithAjna'](table)
  const slides = uniq(
    [
      ...Object.keys(promoCardsData)
        .map((key) => promoCardsData[key as keyof typeof promoCardsData])
        .flatMap(({ default: _default, tokens }) => [
          ..._default,
          ...Object.keys(tokens).flatMap((key) => tokens[key]),
        ]),
    ].filter(({ tokens }) => !!tokens),
  )

  emblaApi?.on('select', () => {
    setAmount(Math.min(emblaApi?.selectedScrollSnap() * slidesToDisplay + slidesToDisplay, SLIDES))
  })

  return (
    <>
      <Box ref={emblaRef} sx={{ overflow: 'hidden' }}>
        <Flex
          sx={{
            ml: '-16px',
            backfaceVisibility: 'hidden',
            touchAction: 'pan-y',
          }}
        >
          {slides.map((slide, i) => (
            <Box key={i} sx={{ flex: `0 0 ${100 / slidesToDisplay}%`, pl: 3 }}>
              <PromoCard {...slide} />
            </Box>
          ))}
        </Flex>
      </Box>
      <Flex sx={{ justifyContent: 'space-between', alignItems: 'center', mt: '24px' }}>
        <Text variant="paragraph3">
          {amount} of {SLIDES}
        </Text>
        <Flex sx={{ columnGap: 2 }}>
          <Button
            variant="tertiary"
            sx={{ px: 2 }}
            onClick={() => emblaApi?.scrollPrev()}
            disabled={!emblaApi?.canScrollPrev()}
          >
            <Icon
              icon={chevron_left}
              color="primary60"
              size="14px"
              sx={{ position: 'relative', left: '-1px', display: 'block' }}
            />
          </Button>
          <Button
            variant="tertiary"
            sx={{ px: 2 }}
            onClick={() => emblaApi?.scrollNext()}
            disabled={!emblaApi?.canScrollNext()}
          >
            <Icon
              icon={chevron_right}
              color="primary60"
              size="14px"
              sx={{ position: 'relative', left: '1px', display: 'block' }}
            />
          </Button>
        </Flex>
      </Flex>
    </>
  )
}
