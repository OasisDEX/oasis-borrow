import { random } from 'lodash'
import React, { useEffect, useState } from 'react'
import type { ThemeUIStyleObject } from 'theme-ui'
import { Container, Grid, Image } from 'theme-ui'
import { fadeInAnimationMobile } from 'theme/animations'

export type ImagesSliderProps = {
  items: {
    imgSrc: string
    imgAlt?: string
    url?: string
    width?: string
    height?: string
  }[]
  wrapperSx?: ThemeUIStyleObject
  gridSx?: ThemeUIStyleObject
  itemSx?: ThemeUIStyleObject
}

export const ImagesSlider = ({ items = [], wrapperSx, gridSx, itemSx }: ImagesSliderProps) => {
  const [activeItemIndex, setActiveItemIndex] = useState(random(0, items.length - 1))

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveItemIndex((prev) => (prev + 1) % items.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [items])

  return items.length ? (
    <Container sx={{ my: 4, overflow: 'hidden', ...wrapperSx }}>
      <Grid
        gap={2}
        sx={{
          gridTemplateColumns: ['repeat(1, 1fr)', `repeat(${items.length}, auto)`],
          alignItems: 'center',
          alignContent: 'center',
          justifyItems: 'center',
          height: '150px',
          ...gridSx,
        }}
      >
        {items.map((item, index) => (
          <Image
            sx={{
              display: [index === activeItemIndex ? 'block' : 'none', 'block'],
              width: ['60%', item.width ? item.width : 'auto'],
              height: [null, item.height ? item.height : 'auto'],
              cursor: item.url ? 'pointer' : 'default',
              ...fadeInAnimationMobile,
              ...itemSx,
              opacity: [0, 0.5],
              transition: 'opacity 0.2s ease-in-out',
              '&:hover': {
                opacity: [0, 1],
              },
            }}
            key={`${item.imgSrc}${item.imgAlt}`}
            src={item.imgSrc}
            alt={item.imgAlt}
            onClick={() => item.url && window.open(item.url, '_blank')}
          />
        ))}
      </Grid>
    </Container>
  ) : null
}
