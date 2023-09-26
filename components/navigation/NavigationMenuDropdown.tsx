import { NavigationMenuDropdownContent } from 'components/navigation/NavigationMenuDropdownContent'
import type { NavigationMenuPanelType } from 'components/navigation/NavigationMenuPanel'
import { NavigationMenuPointer } from 'components/navigation/NavigationMenuPointer'
import React, { useEffect, useRef, useState } from 'react'
import { Flex } from 'theme-ui'

export interface NavigationMenuDropdownProps {
  arrowPosition: number
  currentPanel: string
  isPanelOpen: boolean
  isPanelSwitched: boolean
  panels: NavigationMenuPanelType[]
}

function getDropdownTranslation(
  labelsMap: string[],
  activePanel: string,
  currentPanel: string,
): string {
  if (activePanel === currentPanel) return '0'
  else if (labelsMap.indexOf(currentPanel) > labelsMap.indexOf(activePanel)) return '-20%'
  else return '20%'
}

export function NavigationMenuDropdown({
  arrowPosition,
  currentPanel,
  isPanelOpen,
  isPanelSwitched,
  panels,
}: NavigationMenuDropdownProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [isListSwitched, setIsListSwitched] = useState<boolean>(false)
  const [height, setHeight] = useState<number>(0)

  const labelsMap = panels.map((panel) => panel.label)

  useEffect(() => {
    if (!isPanelOpen) setIsListSwitched(false)
  }, [isPanelOpen])

  return (
    <Flex
      sx={{
        opacity: isPanelOpen ? 1 : 0,
        pointerEvents: isPanelOpen ? 'auto' : 'none',
        transition: 'opacity 200ms',
      }}
    >
      <NavigationMenuPointer
        arrowPosition={arrowPosition}
        isPanelOpen={isPanelOpen}
        isPanelSwitched={isPanelSwitched}
      />
      <Flex
        sx={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          width: '680px',
          mx: 'auto',
          pt: '10px',
        }}
      >
        <Flex
          sx={{
            justifyContent: 'center',
            width: '100%',
            p: 3,
            borderRadius: 'mediumLarge',
            bg: 'neutral10',
            boxShadow: 'buttonMenu',
            overflow: 'hidden',
            transform: isPanelOpen ? 'translateY(0)' : 'translateY(-5px)',
            transition: 'transform 200ms',
            pointerEvents: isPanelOpen ? 'auto' : 'none',
          }}
        >
          <Flex
            sx={{
              position: 'relative',
              flexDirection: 'column',
              width: '100%',
              ...(height > 0 && { height }),
              ...((isPanelSwitched || isListSwitched) && { transition: 'height 200ms' }),
            }}
          >
            {panels.map(({ label, ...panel }, i) => (
              <Flex
                key={i}
                sx={{
                  position: 'absolute',
                  width: '100%',
                  opacity: currentPanel === label ? 1 : 0,
                  pointerEvents: isPanelOpen && currentPanel === label ? 'auto' : 'none',
                  ...(isPanelSwitched && { transition: 'opacity 200ms, transform 200ms' }),
                  transform: `translateX(${getDropdownTranslation(
                    labelsMap,
                    label,
                    currentPanel,
                  )})`,
                }}
                {...(currentPanel === label && { ref })}
              >
                <NavigationMenuDropdownContent
                  currentPanel={currentPanel}
                  isPanelActive={isPanelOpen && currentPanel === label}
                  isPanelOpen={isPanelOpen}
                  label={label}
                  onChange={(_height) => {
                    if (ref.current) setHeight(Math.max(_height, ref.current.offsetHeight))
                  }}
                  onSelect={() => {
                    setIsListSwitched(true)
                  }}
                  {...panel}
                />
              </Flex>
            ))}
          </Flex>
        </Flex>
      </Flex>
    </Flex>
  )
}
