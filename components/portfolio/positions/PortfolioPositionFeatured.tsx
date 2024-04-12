import { usePreloadAppDataContext } from 'components/context/PreloadAppDataContextProvider'
import { Icon } from 'components/Icon'
import type { PortfolioWalletAsset } from 'components/portfolio/types/domain-types'
import { PromoCard, PromoCardLoadingState } from 'components/PromoCard'
import { Skeleton } from 'components/Skeleton'
import useEmblaCarousel from 'embla-carousel-react'
import { getGenericPromoCard } from 'features/productHub/helpers'
import type { PortfolioPosition } from 'handlers/portfolio/types'
import { shuffle } from 'lodash'
import React, { useEffect, useMemo, useState } from 'react'
import { chevron_left, chevron_right } from 'theme/icons'
import { useOnMobile } from 'theme/useBreakpointIndex'
import { Box, Button, Flex, Text } from 'theme-ui'

interface PortfolioPositionFeaturedProps {
  assets?: PortfolioWalletAsset[]
  positions?: PortfolioPosition[]
}

export const PortfolioPositionFeatured = ({
  assets,
  positions,
}: PortfolioPositionFeaturedProps) => {
  const {
    productHub: { table },
  } = usePreloadAppDataContext()
  const isMobile = useOnMobile()
  const slidesToDisplay = isMobile ? 1 : 2
  const [emblaRef, emblaApi] = useEmblaCarousel({ slidesToScroll: slidesToDisplay })

  const [amount, setAmount] = useState<number>(slidesToDisplay)
  const [canScrollPrev, setCanScrollPrev] = useState<boolean>(false)
  const [canScrollNext, setCanScrollNext] = useState<boolean>(true)

  const slides = useMemo(() => {
    if (!!assets && !!positions) {
      return shuffle(table)
        .slice(0, 10)
        .map((product) => getGenericPromoCard({ product }))
    } else return undefined
  }, [assets, positions, table])

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
    <Box>
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
    </Box>
  )
}
