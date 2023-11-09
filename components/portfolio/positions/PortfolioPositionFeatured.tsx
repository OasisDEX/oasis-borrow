import { usePreloadAppDataContext } from 'components/context/PreloadAppDataContextProvider'
import { Icon } from 'components/Icon'
import { PromoCard } from 'components/PromoCard'
import useEmblaCarousel from 'embla-carousel-react'
import { PROMO_CARD_COLLECTIONS_PARSERS } from 'handlers/product-hub/promo-cards'
import { useAppConfig } from 'helpers/config'
import { uniq } from 'lodash'
import React, { useEffect, useState } from 'react'
import { chevron_left, chevron_right } from 'theme/icons'
import { useOnMobile } from 'theme/useBreakpointIndex'
import { Box, Button, Flex, Text } from 'theme-ui'

export const PortfolioPositionFeatured = () => {
  const {
    productHub: { table },
  } = usePreloadAppDataContext()
  const { AjnaSafetySwitch } = useAppConfig('features')

  const isMobile = useOnMobile()
  const slidesToDisplay = isMobile ? 1 : 2
  const [emblaRef, emblaApi] = useEmblaCarousel({ slidesToScroll: slidesToDisplay })

  const [amount, setAmount] = useState<number>(slidesToDisplay)
  const [canScrollPrev, setCanScrollPrev] = useState<boolean>(false)
  const [canScrollNext, setCanScrollNext] = useState<boolean>(true)
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

  function updateSliderUI() {
    if (emblaApi) {
      setCanScrollPrev(emblaApi.canScrollPrev())
      setCanScrollNext(emblaApi.canScrollNext())
      setAmount(
        Math.min(emblaApi?.selectedScrollSnap() * slidesToDisplay + slidesToDisplay, slides.length),
      )
    }
  }

  emblaApi?.on('select', () => updateSliderUI())
  useEffect(() => updateSliderUI(), [isMobile])

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
            <Flex key={i} sx={{ flex: `0 0 ${100 / slidesToDisplay}%`, pl: '16px' }}>
              <PromoCard sx={{ flexGrow: 1 }} {...slide} />
            </Flex>
          ))}
        </Flex>
      </Box>
      <Flex sx={{ justifyContent: 'space-between', alignItems: 'center', mt: '24px' }}>
        <Text variant="paragraph3">
          {amount} of {slides.length}
        </Text>
        <Flex sx={{ columnGap: 2 }}>
          <Button
            variant="tertiary"
            sx={{ px: 2 }}
            onClick={() => emblaApi?.scrollPrev()}
            disabled={!canScrollPrev}
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
            disabled={!canScrollNext}
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
