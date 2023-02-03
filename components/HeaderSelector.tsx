import { Icon } from '@makerdao/dai-ui-icons'
import { ExpandableArrow } from 'components/dumb/ExpandableArrow'
import { useOutsideElementClickHandler } from 'helpers/useOutsideElementClickHandler'
import { useToggle } from 'helpers/useToggle'
import React, { RefObject, useEffect, useRef, useState } from 'react'
import { Box, Flex, Grid, Text } from 'theme-ui'

export interface HeaderSelectorOption {
  icon?: string
  label: string
  value: string
}

interface HeaderSelectorProps {
  defaultOption?: HeaderSelectorOption
  gradient?: [string, string]
  options: HeaderSelectorOption[]
  parentRef: RefObject<HTMLDivElement>
  onChange?: (selected: HeaderSelectorOption) => void
}

export function HeaderSelector({
  defaultOption,
  gradient,
  options,
  parentRef,
  onChange,
}: HeaderSelectorProps) {
  const [isOpen, toggleIsOpen, setIsOpen] = useToggle(false)
  const [selected, setSelected] = useState<HeaderSelectorOption>(
    defaultOption && options.includes(defaultOption) ? defaultOption : options[0],
  )
  const [left, setLeft] = useState<number>(0)
  const ref = useOutsideElementClickHandler(() => setIsOpen(false))
  const selectRef = useRef<HTMLDivElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  function setDropdownPosition() {
    if (selectRef.current && dropdownRef.current && parentRef.current) {
      const offset =
        selectRef.current.offsetLeft -
        Math.round((dropdownRef.current.offsetWidth - selectRef.current.offsetWidth) / 2)
      const maxOffset = parentRef.current.offsetWidth - dropdownRef.current.offsetWidth

      setLeft(Math.max(Math.min(offset, maxOffset), 0))
    }
  }

  useEffect(setDropdownPosition, [selected])

  return (
    <Box sx={{ display: 'inline-flex', zIndex: 2 }} ref={ref}>
      <Flex
        ref={selectRef}
        sx={{
          alignItems: 'center',
          mx: 2,
          px: 2,
          borderBottom: '1px solid',
          borderBottomColor: 'neutral80',
          lineHeight: 'loose',
          cursor: 'pointer',
          color: gradient ? 'transparent' : 'interactive100',
          userSelect: 'none',
          '&:hover': {
            '.withGradient': {
              backgroundPosition: '0 0',
            },
          },
        }}
        onClick={() => {
          toggleIsOpen()
          setDropdownPosition()
        }}
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
          left,
          right: '-100%',
          mt: '1.35em',
          pointerEvents: 'none',
        }}
      >
        <Grid
          ref={dropdownRef}
          as="ul"
          sx={{
            gap: 0,
            gridTemplateColumns: ['repeat(1, 1fr)', 'repeat(2, 1fr)'],
            mt: '12px',
            p: 3,
            bg: 'neutral10',
            border: '1px solid',
            borderColor: 'neutral20',
            borderRadius: 'large',
            boxShadow: 'buttonMenu',
            opacity: isOpen ? 1 : 0,
            transform: isOpen ? 'translateY(0)' : 'translateY(-5px)',
            transition: 'opacity 200ms, transform 200ms',
            listStyle: 'none',
            fontFamily: 'body',
            fontSize: 3,
            fontWeight: 'regular',
            lineHeight: 'body',
            letterSpacing: 0,
            textAlign: 'left',
            pointerEvents: isOpen ? 'auto' : 'none',
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
                setIsOpen(false)
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
