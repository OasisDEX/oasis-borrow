import { NavigationMenuDropdownContentList } from 'components/navigation/NavigationMenuDropdownContentList'
import React, { Fragment, useEffect, useRef, useState } from 'react'
import { Flex } from 'theme-ui'

import type { NavigationMenuPanelType } from './Navigation.types'

export type NavigationMenuDropdownContentProps = NavigationMenuPanelType & {
  currentPanel: string
  isPanelActive: boolean
  isPanelOpen: boolean
  onChange: (height: number) => void
  onSelect: () => void
}

export function NavigationMenuDropdownContent({
  currentPanel,
  isPanelActive,
  isPanelOpen,
  label,
  lists,
  onChange,
  onSelect,
}: NavigationMenuDropdownContentProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [selected, setSelected] = useState<[number, number]>([0, 0])

  useEffect(() => {
    setSelected([0, 0])
  }, [currentPanel, isPanelOpen])
  useEffect(() => {
    if (currentPanel === label && ref.current) onChange(ref.current.offsetHeight)
  }, [currentPanel, selected])

  return (
    <>
      <Flex
        as="ul"
        sx={{
          position: 'relative',
          flexDirection: 'column',
          flexShrink: 0,
          rowGap: 2,
          listStyle: 'none',
          width: '294px',
          ml: 0,
          mr: 3,
          pl: 0,
          pr: 3,
          '&::after': {
            content: '""',
            position: 'absolute',
            width: '1px',
            height: `${ref.current?.offsetHeight}px`,
            minHeight: '100%',
            left: '100%',
            top: 0,
            backgroundColor: 'neutral20',
            transition: 'height 200ms',
          },
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
              parentIndex={i}
              selected={selected}
              onSelect={(_selected) => {
                setSelected(_selected)
                onSelect()
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
          transition: 'transform 250ms',
        }}
      >
        {lists
          .filter(({ items }) => items.filter(({ list }) => list !== undefined))
          .map(({ items }, i) => (
            <Fragment key={i}>
              {items.map(({ list }, j) => (
                <Fragment key={j}>
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
                        opacity: selected[0] === i && selected[1] === j ? 1 : 0,
                        pointerEvents:
                          isPanelActive && selected[0] === i && selected[1] === j ? 'auto' : 'none',
                        transition: 'opacity 250ms, transform 250ms',
                        transform: `translateY(${
                          (selected[0] === i && selected[1] < j) || selected[0] < i
                            ? 50
                            : (selected[0] === i && selected[1] > j) || selected[0] > i
                              ? -50
                              : 0
                        }px)`,
                      }}
                      {...(selected[0] === i && selected[1] === j && { ref })}
                    >
                      <NavigationMenuDropdownContentList {...list} />
                    </Flex>
                  )}
                </Fragment>
              ))}
            </Fragment>
          ))}
      </Flex>
    </>
  )
}
