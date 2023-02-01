import { Icon } from '@makerdao/dai-ui-icons'
import { ExpandableArrow } from 'components/dumb/ExpandableArrow'
import { useOutsideElementClickHandler } from 'helpers/useOutsideElementClickHandler'
import { useToggle } from 'helpers/useToggle'
import React, { useState } from 'react'
import { Box, Flex, Grid, Text } from 'theme-ui'

interface HeaderSelectorOption {
  icon?: string
  label: string
  value: string
}

interface HeaderSelectorProps {
  gradient?: [string, string]
  options: HeaderSelectorOption[]
  onChange?: (selected: HeaderSelectorOption) => void
}

export function HeaderSelector({ gradient, options, onChange }: HeaderSelectorProps) {
  const [isOpen, toggleIsOpen, setIsOpen] = useToggle(false)
  const [selected, setSelected] = useState<HeaderSelectorOption>(options[0])
  const ref = useOutsideElementClickHandler(() => setIsOpen(false))

  return (
    <Box sx={{ position: 'relative', display: 'inline-flex', zIndex: 2 }} ref={ref}>
      <Flex
        sx={{
          alignItems: 'center',
          mx: 2,
          px: 2,
          borderBottom: '1px solid',
          borderBottomColor: 'neutral80',
          lineHeight: 'loose',
          cursor: 'pointer',
          color: gradient ? 'transparent' : 'interactive100',
          '&:hover': {
            '.withGradient': {
              backgroundPosition: '0 0',
            },
          },
        }}
        onClick={toggleIsOpen}
      >
        <Text
          as="span"
          className="withGradient"
          sx={
            gradient && {
              backgroundImage: `linear-gradient(90deg, ${gradient[0]} 0%, ${gradient[0]} 50%, ${gradient[1]} 100%)`,
              backgroundSize: '200% 100%',
              backgroundPosition: isOpen ? '0 0 ' : '100% 0',
              transition: 'background-position 300ms',
              // @ts-ignore
              ...{ WebkitBackgroundClip: 'text' },
            }
          }
        >
          {selected.label}
        </Text>
        <ExpandableArrow
          direction={isOpen ? 'up' : 'down'}
          size={0.32}
          adaptSize
          color="neutral80"
          sx={{ ml: 3 }}
        />
      </Flex>
      <Flex
        sx={{
          position: 'absolute',
          top: '100%',
          left: '0',
          width: '400px',
          mt: '12px',
          p: 3,
          fontFamily: 'body',
          fontSize: 3,
          fontWeight: 'regular',
          lineHeight: 'body',
          letterSpacing: 0,
          textAlign: 'left',
          bg: 'neutral10',
          border: '1px solid',
          borderColor: 'neutral20',
          borderRadius: 'large',
          boxShadow: 'buttonMenu',
          opacity: isOpen ? 1 : 0,
          transform: isOpen ? 'translateY(0)' : 'translateY(-5px)',
          pointerEvents: isOpen ? 'auto' : 'none',
          transition: 'opacity 200ms, transform 200ms',
        }}
      >
        <Grid
          as="ul"
          sx={{
            gap: 0,
            gridTemplateColumns: 'repeat(2,1fr )',
            width: '100%',
            listStyle: 'none',
            p: 0,
          }}
        >
          {options.map((option, i) => (
            <Flex
              key={i}
              as="li"
              sx={{
                px: 3,
                py: 2,
                borderRadius: 'medium',
                cursor: 'pointer',
                transition: 'background-color 200ms',
                alignItems: 'center',
                '&:hover': {
                  bg: 'neutral30',
                },
              }}
              onClick={() => {
                setSelected(option)
                if (onChange) onChange(option)
              }}
            >
              {option.icon && (
                <Icon size={32} sx={{ flexShrink: 0, mr: '12px' }} name={option.icon} />
              )}
              {option.label}
            </Flex>
          ))}
        </Grid>
      </Flex>
    </Box>
  )
}
