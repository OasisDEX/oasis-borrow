import { Icon } from 'components/Icon'
import useEmblaCarousel from 'embla-carousel-react'
import type { FC, ReactNode } from 'react'
import React, { useEffect, useState } from 'react'
import { arrow_left, arrow_right } from 'theme/icons'
import { useOnMobile } from 'theme/useBreakpointIndex'
import { Box, Button, Flex } from 'theme-ui'

interface SimpleCarouselProps {
  gap?: number
  header?: ReactNode
  overflow?: 'hidden' | 'visible'
  slides: ReactNode[]
  slidesToDisplay?: number
  slidesToScroll?: number
}

export const SimpleCarousel: FC<SimpleCarouselProps> = ({
  gap = 16,
  header,
  overflow = 'hidden',
  slides,
  slidesToDisplay = 1,
  slidesToScroll = 1,
}) => {
  const isMobile = useOnMobile()
  const resolvedSlidesToDisplay = isMobile ? 1 : slidesToDisplay
  const resolvedSlidesToScroll = isMobile ? 1 : slidesToScroll
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    containScroll: false,
    slidesToScroll: resolvedSlidesToScroll,
  })

  const [canScrollPrev, setCanScrollPrev] = useState<boolean>(false)
  const [canScrollNext, setCanScrollNext] = useState<boolean>(true)

  emblaApi?.on('select', () => updateSliderUI())
  useEffect(() => updateSliderUI(), [isMobile])

  function updateSliderUI() {
    if (emblaApi) {
      setCanScrollPrev(emblaApi.canScrollPrev())
      setCanScrollNext(emblaApi.canScrollNext())
    }
  }

  return (
    <Box>
      <Flex
        sx={{
          alignItems: 'flex-end',
          justifyContent: header ? 'space-between' : 'flex-end',
          mb: 5,
        }}
      >
        {header}
        <Flex sx={{ columnGap: '12px', flexShrink: 0 }}>
          <Button
            variant="action"
            sx={{ p: '12px' }}
            onClick={() => emblaApi?.scrollPrev()}
            disabled={!canScrollPrev}
          >
            <Icon icon={arrow_left} size="16px" sx={{ position: 'relative', display: 'block' }} />
          </Button>
          <Button
            variant="action"
            sx={{ p: '12px' }}
            onClick={() => emblaApi?.scrollNext()}
            disabled={!canScrollNext}
          >
            <Icon icon={arrow_right} size="16px" sx={{ position: 'relative', display: 'block' }} />
          </Button>
        </Flex>
      </Flex>
      <Box ref={emblaRef} sx={{ overflow }}>
        <Flex
          sx={{
            ml: `-${gap}px`,
            backfaceVisibility: 'hidden',
            touchAction: 'pan-y',
          }}
        >
          {slides.map((slide, i) => (
            <Flex key={i} sx={{ flex: `0 0 ${100 / resolvedSlidesToDisplay}%`, pl: `${gap}px` }}>
              {slide}
            </Flex>
          ))}
        </Flex>
      </Box>
    </Box>
  )
}
