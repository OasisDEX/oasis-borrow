import { PromoCard } from 'components/PromoCard'
import useEmblaCarousel from 'embla-carousel-react'
import React, { useState } from 'react'
import { Box, Button, Flex } from 'theme-ui'

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
      <span>
        {amount} of {SLIDES}
      </span>
      <Button
        onClick={() => {
          emblaApi?.scrollPrev()
        }}
      >
        Prev
      </Button>
      <Button
        onClick={() => {
          emblaApi?.scrollNext()
        }}
      >
        Next
      </Button>
    </>
  )
}
