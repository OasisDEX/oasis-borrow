import { AppLink } from 'components/Links'
import { NavigationMenuDropdownContentListItem } from 'components/navigation/NavigationMenuDropdownContentListItem'
import type { NavigationMenuPanelList } from 'components/navigation/NavigationMenuPanel'
import { WithArrow } from 'components/WithArrow'
import React from 'react'
import { Box, Heading } from 'theme-ui'

type NavigationMenuDropdownContentListProps = NavigationMenuPanelList & {
  parentIndex?: number
  selected?: [number, number]
  onSelect?: (selected: [number, number]) => void
}

export function NavigationMenuDropdownContentList({
  header,
  items,
  link,
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
    px: tight ? 2 : 3,
  }

  return (
    <>
      {header && (
        <Heading
          variant="paragraph4"
          sx={{
            mx: tight ? 2 : 3,
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
        {items.map(({ hoverColor, url, ...item }, i) => (
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
              ...(url && { '&:hover': itemHoverEffect }),
            }}
            onMouseEnter={() => {
              parentIndex !== undefined && onSelect && onSelect([parentIndex, i])
            }}
          >
            {url ? (
              <AppLink href={url} sx={{ display: 'block', ...itemInnerPadding }}>
                <NavigationMenuDropdownContentListItem hoverColor={hoverColor} {...item} />
              </AppLink>
            ) : (
              <Box sx={{ ...itemInnerPadding }}>
                <NavigationMenuDropdownContentListItem hoverColor={hoverColor} {...item} />
              </Box>
            )}
          </Box>
        ))}
      </Box>
      {link && (
        <AppLink
          href={link.url}
          sx={{
            ml: tight ? 2 : 3,
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
        </AppLink>
      )}
    </>
  )
}
