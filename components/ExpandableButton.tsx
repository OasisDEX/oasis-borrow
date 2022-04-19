import { Icon } from '@makerdao/dai-ui-icons'
import { useOutsideElementClickHandler } from 'helpers/useOutsideElementClickHandler'
import React, { useState } from 'react'
import { Box, Button, Text } from 'theme-ui'

export interface IButtonWithAction {
  label: string
  action: () => void
}

export interface IButtonWithActions {
  label: string
  actions: IButtonWithAction[]
}

export function ExpandableButton({ button }: { button: IButtonWithAction | IButtonWithActions }) {
  const [expanded, setExpanded] = useState(false)
  const componentRef = useOutsideElementClickHandler(() => setExpanded(false))
  const clickHandler = (): void => {
    if ('action' in button) button.action()
    else if ('actions' in button) setExpanded(!expanded)
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
      <Button variant={!expanded ? 'action' : 'actionActive'} onClick={clickHandler}>
        {button.label}
        {'actions' in button && (
          <Icon
            name={`chevron_${expanded ? 'up' : 'down'}`}
            size="auto"
            width="12px"
            height="7px"
            color="text.subtitle"
            sx={{ ml: 2 }}
          />
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
            backgroundColor: 'surface',
            borderRadius: 'medium',
            boxShadow: '0px 0px 4px rgba(0, 0, 0, 0.15)',
            opacity: expanded ? 1 : 0,
            transform: expanded ? 'translateY(0)' : 'translateY(-5px)',
            transition: 'opacity 150ms, transform 150ms',
          }}
        >
          {button.actions.map((item) => (
            <Text
              as="li"
              onClick={() => {
                setExpanded(false)
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
                  backgroundColor: 'border',
                },
                cursor: 'pointer',
              }}
            >
              {item.label}
            </Text>
          ))}
        </Box>
      )}
    </Box>
  )
}
