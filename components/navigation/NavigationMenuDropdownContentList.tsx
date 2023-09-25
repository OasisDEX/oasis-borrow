import { AppLink } from 'components/Links'
import { NavigationMenuDropdownContentIcon } from 'components/navigation/NavigationMenuDropdownContentIcon'
import type { NavigationMenuPanelList } from 'components/navigation/NavigationMenuPanel'
import { WithArrow } from 'components/WithArrow'
import React, { Fragment } from 'react'
import type { SxStyleProp } from 'theme-ui'
import { Box, Flex, Heading, Text } from 'theme-ui'

export type NavigationMenuDropdownContentListItemProps =
  NavigationMenuPanelList['items'] extends readonly (infer ElementType)[] ? ElementType : never
export type NavigationMenuDropdownContentListProps = NavigationMenuPanelList

export function NavigationMenuDropdownContentListItem({
  description,
  hoverColor,
  icon,
  tags,
  title,
}: NavigationMenuDropdownContentListItemProps) {
  return (
    <Flex sx={{ alignItems: 'center', columnGap: 2 }}>
      {icon && icon.position === 'global' && <NavigationMenuDropdownContentIcon {...icon} />}
      <Box>
        <Flex sx={{ alignItems: 'center', columnGap: 2 }}>
          {icon && icon.position === 'title' && <NavigationMenuDropdownContentIcon {...icon} />}
          <Heading
            as="h3"
            variant="boldParagraph3"
            className="heading"
            data-value={title}
            sx={
              {
                position: 'relative',
                color: 'primary100',
                transition: 'color 200ms',
                ...(hoverColor && {
                  '&::after': {
                    content: 'attr(data-value)',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    opacity: 0,
                    transition: 'opacity 200ms',
                    '-webkit-background-clip': 'text',
                    backgroundImage: hoverColor,
                  },
                }),
              } as SxStyleProp
            }
          >
            {title}
          </Heading>
        </Flex>
        {description && (
          <Text as="p" variant="paragraph4" sx={{ mt: 1, color: 'neutral80' }}>
            {description}
          </Text>
        )}
        {tags && (
          <Text as="p" variant="paragraph4" sx={{ color: 'neutral80' }}>
            {tags.join(' • ')}
          </Text>
        )}
      </Box>
    </Flex>
  )
}

export function NavigationMenuDropdownContentList({
  header,
  items,
  link,
  tight,
}: NavigationMenuDropdownContentListProps) {
  const innerPadding = {
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
        {items.map(({ hoverColor, url, ...item }) => (
          <Box
            as="li"
            sx={{
              cursor: 'default',
              backgroundColor: 'neutral10',
              borderRadius: 'mediumLarge',
              transition: '200ms background-color',
              '&:hover': {
                backgroundColor: 'neutral30',
                '.nav-icon': {
                  color: 'neutral10',
                  backgroundColor: 'interactive100',
                },
                ...(hoverColor && {
                  '.heading': {
                    color: 'transparent',
                    '&::after': {
                      opacity: 1,
                    },
                  },
                }),
              },
            }}
          >
            {url ? (
              <AppLink href={url} sx={{ display: 'block', ...innerPadding }}>
                <NavigationMenuDropdownContentListItem hoverColor={hoverColor} {...item} />
              </AppLink>
            ) : (
              <Box sx={{ ...innerPadding }}>
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
