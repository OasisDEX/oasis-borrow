import { Icon } from 'components/Icon'
import { PromoCard } from 'components/PromoCard'
import useEmblaCarousel from 'embla-carousel-react'
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
  const [emblaRef, emblaApi] = useEmblaCarousel({ slidesToScroll: slidesToDisplay })
  const [amount, setAmount] = useState<number>(slidesToDisplay)

  emblaApi?.on('select', () => {
    setAmount(Math.min(emblaApi?.selectedScrollSnap() * slidesToDisplay + slidesToDisplay, SLIDES))
  })

  return (
    <>
      <Box ref={emblaRef} sx={{ overflow: 'hidden' }}>
        <Flex
          sx={{
            ml: '-16px',
          }}
        >
          {Array.from(Array(SLIDES).keys()).map((index) => (
            <Box key={index} sx={{ flex: `0 0 ${100 / slidesToDisplay}%`, pl: 3 }}>
              <PromoCard title={`Title ${index + 1}`} tokens={['ETH', 'DAI']} />
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
