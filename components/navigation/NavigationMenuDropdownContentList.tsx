import type { NavigationMenuPanelList } from 'components/navigation/Navigation.types'
import { NavigationMenuDropdownContentListItem } from 'components/navigation/NavigationMenuDropdownContentListItem'
import { WithArrow } from 'components/WithArrow'
import React from 'react'
import { Box, Heading, Link } from 'theme-ui'

type NavigationMenuDropdownContentListProps = NavigationMenuPanelList & {
  parentIndex?: number
  selected?: [number, number]
  onClick?: (selected: [number, number]) => void
  onSelect?: (selected: [number, number]) => void
}

export function NavigationMenuDropdownContentList({
  header,
  items,
  link,
  onClick,
  onSelect,
  parentIndex,
  selected,
  tight,
}: NavigationMenuDropdownContentListProps) {
  const itemHoverEffect = {
    backgroundColor: 'neutral30',
    '.star-with-effect': {
      color: 'interactive100',
    },
    '.nav-icon': {
      color: 'neutral10',
      backgroundColor: 'interactive100',
    },
    '.heading-with-effect, .tag-with-effect': {
      color: 'transparent',
      '&::after': {
        opacity: 1,
      },
    },
  }
  const itemInnerPadding = {
    py: tight ? 2 : '12px',
    px: 3,
  }

  return (
    <>
      {header && (
        <Heading
          variant="paragraph4"
          sx={{
            mx: 3,
            mt: 2,
            mb: '-8px',
            color: 'neutral80',
          }}
        >
          {header}
        </Heading>
      )}
      <Box
        as="ul"
        sx={{
          listStyle: 'none',
          m: 0,
          p: 0,
        }}
      >
        {items.map(({ callback, hoverColor, url, ...item }, i) => (
          <Box
            key={i}
            as="li"
            sx={{
              borderRadius: 'mediumLarge',
              transition: '200ms background-color',
              ...(selected?.[0] === parentIndex &&
                selected?.[1] === i && {
                  cursor: 'default',
                  ...itemHoverEffect,
                }),
              ...((url || onClick || callback) && {
                cursor: 'pointer',
                '&:hover': itemHoverEffect,
              }),
            }}
            onClick={() => {
              onClick && onClick([parentIndex ?? 0, i])
            }}
            onMouseEnter={() => {
              parentIndex !== undefined && onSelect && onSelect([parentIndex, i])
            }}
          >
            {url ? (
              <Link href={url} sx={{ display: 'block', ...itemInnerPadding }}>
                <NavigationMenuDropdownContentListItem hoverColor={hoverColor} {...item} />
              </Link>
            ) : (
              <Box sx={{ ...itemInnerPadding }} onClick={callback}>
                <NavigationMenuDropdownContentListItem hoverColor={hoverColor} {...item} />
              </Box>
            )}
          </Box>
        ))}
      </Box>
      {link && (
        <Link
          href={link.url}
          sx={{
            ml: 3,
            mr: 'auto',
            display: 'inline-block',
          }}
        >
          <WithArrow
            gap={1}
            sx={{
              fontSize: 1,
              color: 'interactive100',
            }}
          >
            {link.label}
          </WithArrow>
        </Link>
      )}
    </>
  )
}
