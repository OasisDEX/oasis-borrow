import { ExpandableArrow } from 'components/dumb/ExpandableArrow'
import { mobileLinkSx } from 'components/navigation/common'
import { NavigationMenuDropdownContentList } from 'components/navigation/NavigationMenuDropdownContentList'
import { useToggle } from 'helpers/useToggle'
import React, { Fragment, useEffect } from 'react'
import { Box, Button, Flex } from 'theme-ui'

import type { NavigationMenuPanelType } from './Navigation.types'

type NavigationMobileMenuPanelProps = NavigationMenuPanelType & {
  isOpen: boolean
  openNestedMenu?: [string, number, number]
  onOpenNestedMenu: (openNestedMenu: [string, number, number]) => void
}

export function NavigationMobileMenuPanel({
  isOpen,
  label,
  lists,
  onOpenNestedMenu,
  openNestedMenu,
}: NavigationMobileMenuPanelProps) {
  const [isAccordionOpen, toggleIsAccordionOpen, setIsAccordionOpen] = useToggle(false)

  useEffect(() => {
    if (!isOpen) setIsAccordionOpen(false)
  }, [isOpen])

  return (
    <>
      {openNestedMenu ? (
        <>
          {lists
            .filter(({ items }) => items.filter(({ list }) => list !== undefined))
            .map(({ items }, i) => (
              <Fragment key={i}>
                {items.map(({ list }, j) => (
                  <Fragment key={`${i}-${j}`}>
                    {list &&
                      openNestedMenu[0] === label &&
                      openNestedMenu[1] === i &&
                      openNestedMenu[2] === j && (
                        <Flex
                          as="li"
                          sx={{
                            rowGap: 3,
                            flexDirection: 'column',
                          }}
                        >
                          <NavigationMenuDropdownContentList {...list} />
                        </Flex>
                      )}
                  </Fragment>
                ))}
              </Fragment>
            ))}
        </>
      ) : (
        <Box key={`link-${label}`} as="li">
          <Button
            sx={{
              ...mobileLinkSx(isAccordionOpen),
              cursor: 'pointer',
            }}
            onClick={() => {
              toggleIsAccordionOpen()
            }}
          >
            {label}{' '}
            <ExpandableArrow
              direction={isAccordionOpen ? 'up' : 'down'}
              size={13}
              color="primary60"
            />
          </Button>
          {isAccordionOpen && (
            <Box
              as="ul"
              sx={{
                pt: 3,
                pl: 0,
                listStyle: 'none',
              }}
            >
              {lists.map((item, i) => (
                <Flex
                  key={i}
                  as="li"
                  sx={{
                    rowGap: 3,
                    flexDirection: 'column',
                  }}
                >
                  <NavigationMenuDropdownContentList
                    parentIndex={i}
                    onClick={(selected) => onOpenNestedMenu([label, ...selected])}
                    {...item}
                  />
                </Flex>
              ))}
            </Box>
          )}
        </Box>
      )}
    </>
  )
}
