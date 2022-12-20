import { NavigationMenuDropdownContent } from 'components/navigation/NavigationMenuDropdownContent'
import { NavigationMenuPanelType } from 'components/navigation/NavigationMenuPanel'
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
  const [width, setWidth] = useState<number>(0)
  const [height, setHeight] = useState<number>(0)

  const labelsMap = panels.map((panel) => panel.label)

  useEffect(() => {
    if (ref.current) {
      setWidth(ref.current.offsetWidth)
      setHeight(ref.current.offsetHeight)
    }
  }, [currentPanel, isPanelOpen])

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
          left: '-100%',
          right: '-100%',
          justifyContent: 'center',
          transform: isPanelOpen ? 'translateY(0)' : 'translateY(-5px)',
          transition: 'transform 200ms',
          pointerEvents: 'none',
        }}
      >
        <Flex
          sx={{
            position: 'relative',
            p: 4,
            borderRadius: 'large',
            bg: 'neutral10',
            boxShadow: 'buttonMenu',
            overflow: 'hidden',
            pointerEvents: isPanelOpen ? 'auto' : 'none',
          }}
        >
          <Flex
            sx={{
              flexDirection: 'column',
              ...(width > 0 && { width }),
              ...(height > 0 && { height }),
              ...(isPanelSwitched && { transition: 'width 200ms, height 200ms' }),
            }}
          >
            {panels.map(({ label, ...panel }, i) => (
              <Flex key={i} sx={{ ml: '-100%', transform: 'translateX(50%)' }}>
                <Flex
                  sx={{
                    position: 'absolute',
                    flexDirection: 'column',
                    rowGap: 4,
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
                  <NavigationMenuDropdownContent label={label} {...panel} />
                </Flex>
              </Flex>
            ))}
          </Flex>
        </Flex>
      </Flex>
    </Flex>
  )
}
