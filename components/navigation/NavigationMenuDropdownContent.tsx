import type { NavigationMenuPanelType } from 'components/navigation/NavigationMenuPanel'
import React from 'react'
import { Box, Flex, Heading, Text } from 'theme-ui'

export type NavigationMenuDropdownContentProps = NavigationMenuPanelType

export function NavigationMenuDropdownContent({ lists }: NavigationMenuDropdownContentProps) {
  return (
    <Flex>
      <Box
        as="ul"
        sx={{
          listStyle: 'none',
          width: '310px',
          m: 0,
          p: 3,
          borderRight: '1px solid',
          borderColor: 'neutral20',
        }}
      >
        {lists.map(({ items }) => (
          <Box as="li">
            <Box
              as="ul"
              sx={{
                listStyle: 'none',
                m: 0,
                p: 0,
              }}
            >
              {items.map(({ description, title }) => (
                <Box
                  as="li"
                  sx={{
                    p: 3,
                    cursor: 'default',
                    backgroundColor: 'neutral10',
                    borderRadius: 'mediumLarge',
                    transition: '200ms background-color',
                    '&:hover': {
                      backgroundColor: 'neutral30',
                    },
                  }}
                >
                  <Heading variant="boldParagraph3">{title}</Heading>
                  {description && (
                    <Text as="p" variant="paragraph4" sx={{ mt: 1, color: 'neutral80' }}>
                      {description}
                    </Text>
                  )}
                </Box>
              ))}
            </Box>
          </Box>
        ))}
      </Box>
    </Flex>
  )
}
