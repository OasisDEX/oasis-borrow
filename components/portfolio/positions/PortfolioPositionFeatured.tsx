import { usePreloadAppDataContext } from 'components/context/PreloadAppDataContextProvider'
import { Icon } from 'components/Icon'
import { PromoCard, PromoCardLoadingState } from 'components/PromoCard'
import { Skeleton } from 'components/Skeleton'
import useEmblaCarousel from 'embla-carousel-react'
import type { PortfolioPosition } from 'handlers/portfolio/types'
import { PROMO_CARD_COLLECTIONS_PARSERS } from 'handlers/product-hub/promo-cards'
import { useAppConfig } from 'helpers/config'
import { shuffle, uniq } from 'lodash'
import React, { useEffect, useMemo, useState } from 'react'
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

  const isMobile = useOnMobile()
  const slidesToDisplay = isMobile ? 1 : 2
  const [emblaRef, emblaApi] = useEmblaCarousel({ slidesToScroll: slidesToDisplay })

  const [amount, setAmount] = useState<number>(slidesToDisplay)
  const [canScrollPrev, setCanScrollPrev] = useState<boolean>(false)
  const [canScrollNext, setCanScrollNext] = useState<boolean>(true)
  const promoCardsData =
    PROMO_CARD_COLLECTIONS_PARSERS[AjnaSafetySwitch ? 'Home' : 'HomeWithAjna'](table)

  const slides = useMemo(() => {
    if (!!assets && !!positions) {
      return shuffle(
        uniq(
          [
            ...Object.keys(promoCardsData)
              .map((key) => promoCardsData[key as keyof typeof promoCardsData])
              .flatMap(({ default: _default, tokens }) => [
                ..._default,
                ...Object.keys(tokens).flatMap((key) => tokens[key]),
              ]),
          ]
            // filter out promo cards that aren't token
            .filter(({ tokens }) => !!tokens),
        )
          // filter out promo cards of products that user already has
          .filter(
            ({ protocol, tokens }) =>
              !positions.find(
                ({ network, primaryToken, protocol: _protocol, secondaryToken }) =>
                  network === protocol?.network &&
                  _protocol === protocol.protocol &&
                  (tokens?.join('') === `${primaryToken}${secondaryToken}` ||
                    (tokens?.length === 1 && tokens[0] === primaryToken)),
              ),
          )
          // filter out promo cards of products using assets that user doesn't have
          .filter(
            ({ protocol, tokens }) =>
              !!assets.find(
                ({ network, symbol }) =>
                  network === protocol?.network && tokens?.includes(symbol.toUpperCase()),
              ),
          ),
      )
    } else return undefined
  }, [assets, positions, promoCardsData])

  function updateSliderUI() {
    if (slides && emblaApi) {
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
      <Box
        {...(slides && slides.length > slidesToDisplay && { ref: emblaRef })}
        sx={{ overflow: 'hidden' }}
      >
        <Flex
          sx={{
            ml: '-16px',
            backfaceVisibility: 'hidden',
            touchAction: 'pan-y',
          }}
        >
          {slides ? (
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
      {slides && slides.length > slidesToDisplay && (
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
      )}
      {slides === undefined && <Skeleton width={5} height="22px" sx={{ mt: '28px', mb: 1 }} />}
    </>
  )
}
