import { usePreloadAppDataContext } from 'components/context/PreloadAppDataContextProvider'
import { Icon } from 'components/Icon'
import { PromoCard, PromoCardLoadingState } from 'components/PromoCard'
import { Skeleton } from 'components/Skeleton'
import useEmblaCarousel from 'embla-carousel-react'
import type { PortfolioPosition } from 'handlers/portfolio/types'
import { PROMO_CARD_COLLECTIONS_PARSERS } from 'handlers/product-hub/promo-cards'
import { useAppConfig } from 'helpers/config'
import { uniq } from 'lodash'
import React, { useEffect, useState } from 'react'
import { chevron_left, chevron_right } from 'theme/icons'
import { useOnMobile } from 'theme/useBreakpointIndex'
import { Box, Button, Flex, Text } from 'theme-ui'

import type { PortfolioAsset } from 'lambdas/src/shared/domain-types'

interface PortfolioPositionFeaturedProps {
  assets?: PortfolioAsset[]
  positions?: PortfolioPosition[]
}

export const PortfolioPositionFeatured = ({
  assets,
  positions,
}: PortfolioPositionFeaturedProps) => {
  const {
    productHub: { table },
  } = usePreloadAppDataContext()
  const { AjnaSafetySwitch } = useAppConfig('features')

  // const isLoaded = true
  const isLoaded = !!assets && !!positions

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
          {isLoaded ? (
            <>
              {slides.map((slide, i) => (
                <Flex key={i} sx={{ flex: `0 0 ${100 / slidesToDisplay}%`, pl: 3 }}>
                  <PromoCard sx={{ flexGrow: 1 }} {...slide} />
                </Flex>
              ))}
            </>
          ) : (
            <Flex sx={{ width: '100%', columnGap: 3, pl: 3 }}>
              <PromoCardLoadingState sx={{ flexGrow: 1 }} />
              {!isMobile && <PromoCardLoadingState sx={{ flexGrow: 1 }} />}
            </Flex>
          )}
        </Flex>
      </Box>
      <Flex sx={{ justifyContent: 'space-between', alignItems: 'center', mt: '24px' }}>
        {isLoaded ? (
          <Text variant="paragraph3">
            {amount} of {slides.length}
          </Text>
        ) : (
          <Skeleton width={5} height="22px" sx={{ my: 1 }} />
        )}
        {isLoaded && (
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
        )}
      </Flex>
    </>
  )
}
