import { NavigationMenuDropdownContentList } from 'components/navigation/NavigationMenuDropdownContentList'
import type { NavigationMenuPanelType } from 'components/navigation/NavigationMenuPanel'
import React, { Fragment } from 'react'
import { Flex } from 'theme-ui'

export type NavigationMenuDropdownContentProps = NavigationMenuPanelType

export function NavigationMenuDropdownContent({ lists }: NavigationMenuDropdownContentProps) {
  return (
    <>
      <Flex
        as="ul"
        sx={{
          flexDirection: 'column',
          flexShrink: 0,
          rowGap: 2,
          listStyle: 'none',
          width: '294px',
          ml: 0,
          mr: 3,
          pl: 0,
          pr: 3,
          borderRight: '1px solid',
          borderColor: 'neutral20',
        }}
      >
        {lists.map((item, i) => (
          <Flex
            key={i}
            as="li"
            sx={{
              rowGap: 3,
              flexDirection: 'column',
              width: '100%',
            }}
          >
            <NavigationMenuDropdownContentList {...item} />
          </Flex>
        ))}
      </Flex>
      <Flex
        as="ul"
        sx={{
          flexDirection: 'column',
          listStyle: 'none',
          width: '100%',
          m: 0,
          p: 0,
        }}
      >
        {lists.map(({ items }, i) => (
          <Fragment key={i}>
            {items.map(({ list }, j) => (
              <>
                {list && (
                  <Flex
                    key={`${i}-${j}`}
                    as="li"
                    sx={{
                      rowGap: 3,
                      flexDirection: 'column',
                      width: '100%',
                    }}
                  >
                    <NavigationMenuDropdownContentList {...list} />
                  </Flex>
                )}
              </>
            ))}
          </Fragment>
        ))}
      </Flex>
    </>
  )
}
