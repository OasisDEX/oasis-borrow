import { renderCssGradient } from 'features/marketing-layouts/helpers'
import type { ReactNode } from 'react'
import React, { useEffect, useRef, useState } from 'react'
import { Box, Flex, type ThemeUIStyleObject } from 'theme-ui'

interface TabsProps<T> {
  defaultId: T
  dependency?: unknown[]
  gap?: string | number
  items: {
    content: (isSelected: boolean) => ReactNode
    id: T
  }[]
  onClick: (id: T) => void
  sx?: ThemeUIStyleObject
  underlineGradient?: [string, string, ...string[]]
  underlinePadding?: string | number
  underlineSize?: string | number
}

export function Tabs<T>({
  defaultId,
  dependency = [],
  gap = 4,
  items,
  onClick,
  sx,
  underlineGradient,
  underlinePadding = 0,
  underlineSize = '2px',
}: TabsProps<T>) {
  const ref = useRef<HTMLDivElement>(null)
  const [underlineWidth, setUnderlineWidth] = useState<number>(0)
  const [underlineX, setUnderlineX] = useState<number>(0)
  const [selectedId, setSelectedId] = useState<T>(defaultId)

  useEffect(() => {
    if (ref.current) {
      setUnderlineWidth(ref.current.offsetWidth)
      setUnderlineX(ref.current.offsetLeft)
    }
  }, [dependency, ref, selectedId])
  useEffect(() => {
    setSelectedId(defaultId)
  }, [defaultId])

  return (
    <Flex
      sx={{
        position: 'relative',
        pb: underlinePadding,
        overflowX: 'auto',
        overflowY: 'hidden',
        ...sx,
      }}
    >
      <Flex
        as="ul"
        sx={{
          m: 0,
          p: 0,
          listStyle: 'none',
          columnGap: [4, gap],
        }}
      >
        {items.map(({ content, id }) => (
          <Box
            {...(id === selectedId && { ref })}
            as="li"
            onClick={() => {
              onClick(id)
              setSelectedId(id)
            }}
            sx={{ flexShrink: '0', position: 'relative', cursor: 'pointer' }}
          >
            {content(id === selectedId)}
          </Box>
        ))}
      </Flex>
      <Box
        sx={{
          position: 'absolute',
          bottom: 0,
          left: `${underlineX}px`,
          width: `${underlineWidth}px`,
          height: underlineSize,
          background: underlineGradient
            ? renderCssGradient('-90deg', underlineGradient)
            : 'primary100',
          transition: underlineWidth > 0 ? '200ms left, 200ms width' : 'none',
          pointerEvents: 'none',
        }}
      />
    </Flex>
  )
}
