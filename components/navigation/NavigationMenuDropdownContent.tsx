import { NavigationMenuDropdownContentList } from 'components/navigation/NavigationMenuDropdownContentList'
import type { NavigationMenuPanelType } from 'components/navigation/NavigationMenuPanel'
import React, { Fragment, useState } from 'react'
import { Flex } from 'theme-ui'

export type NavigationMenuDropdownContentProps = NavigationMenuPanelType & {
  isPanelActive: boolean
}

export function NavigationMenuDropdownContent({
  isPanelActive,
  lists,
}: NavigationMenuDropdownContentProps) {
  const [active, setActive] = useState<number>(0)

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
            <NavigationMenuDropdownContentList
              {...item}
              onSelect={(_active) => {
                setActive(_active)
              }}
            />
          </Flex>
        ))}
      </Flex>
      <Flex
        as="ul"
        sx={{
          position: 'relative',
          flexDirection: 'column',
          listStyle: 'none',
          width: '100%',
          m: 0,
          p: 0,
          transform: `translateY(${active * -50}px)`,
          transition: 'transform 250ms',
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
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      rowGap: 3,
                      flexDirection: 'column',
                      width: '100%',
                      opacity: active === j ? 1 : 0,
                      pointerEvents: isPanelActive && active === j ? 'auto' : 'none',
                      transition: 'opacity 250ms',
                      transform: `translateY(${j * 50}px)`,
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
