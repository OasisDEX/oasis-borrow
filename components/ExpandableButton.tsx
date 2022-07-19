import { useOutsideElementClickHandler } from 'helpers/useOutsideElementClickHandler'
import React, { useState } from 'react'
import { Box, Button, Text } from 'theme-ui'

import { ExpandableArrow } from './dumb/ExpandableArrow'

export interface ButtonWithAction {
  label: string
  action: () => void
}

export interface ButtonWithActions {
  label: string
  actions: ButtonWithAction[]
}

export function ExpandableButton({ button }: { button: ButtonWithAction | ButtonWithActions }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const componentRef = useOutsideElementClickHandler(() => setIsExpanded(false))
  const clickHandler = (): void => {
    if ('action' in button) button.action()
    else if ('actions' in button) setIsExpanded(!isExpanded)
  }

  return (
    <Box
      ref={componentRef}
      sx={{
        position: 'relative',
        ml: 2,
        '&:first-child': {
          ml: 0,
        },
      }}
    >
      <Button variant={!isExpanded ? 'action' : 'actionActive'} onClick={clickHandler}>
        {button.label}
        {'actions' in button && (
          <ExpandableArrow size={10} direction={isExpanded ? 'up' : 'down'} sx={{ ml: 2 }} />
        )}
      </Button>
      {'actions' in button && (
        <Box
          as="ul"
          sx={{
            listStyle: 'none',
            position: 'absolute',
            top: '100%',
            right: 0,
            left: 0,
            mt: 2,
            px: 0,
            py: '12px',
            backgroundColor: 'neutral10',
            borderRadius: 'medium',
            boxShadow: '0px 0px 4px rgba(0, 0, 0, 0.15)',
            opacity: isExpanded ? 1 : 0,
            transform: isExpanded ? 'translateY(0)' : 'translateY(-5px)',
            pointerEvents: isExpanded ? 'auto' : 'none',
            transition: 'opacity 200ms, transform 200ms',
          }}
        >
          {button.actions.map((item, k) => (
            <Text
              as="li"
              onClick={() => {
                setIsExpanded(false)
                item.action()
              }}
              sx={{
                p: 2,
                fontFamily: 'body',
                fontSize: 1,
                fontWeight: 'semiBold',
                backgroundColor: 'transparent',
                transition: 'background-color 150ms',
                '&:hover': {
                  backgroundColor: 'neutral20',
                },
                cursor: 'pointer',
              }}
              key={k}
            >
              {item.label}
            </Text>
          ))}
        </Box>
      )}
    </Box>
  )
}
