import { Icon } from '@makerdao/dai-ui-icons'
import { ExpandableArrow } from 'components/dumb/ExpandableArrow'
import { useOutsideElementClickHandler } from 'helpers/useOutsideElementClickHandler'
import { useToggle } from 'helpers/useToggle'
import type { RefObject } from 'react'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Box, Flex, Text } from 'theme-ui'

export interface HeaderSelectorOption {
  icon?: string | [string, string]
  title: string
  description?: string
  balance?: string
  value: string
}

interface HeaderSelectorProps {
  defaultOption?: HeaderSelectorOption
  gradient: [string, string, ...string[]]
  options: HeaderSelectorOption[]
  overwriteOption?: HeaderSelectorOption
  parentRef: RefObject<HTMLDivElement>
  withHeaders?: boolean
  valueAsLabel?: boolean
  onChange?: (selected: HeaderSelectorOption) => void
}

export function HeaderSelector({
  defaultOption,
  gradient,
  options,
  overwriteOption,
  parentRef,
  withHeaders,
  valueAsLabel,
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
  const textRef = useRef<HTMLDivElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

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
  useEffect(() => {
    if (overwriteOption) {
      setSelected(overwriteOption)
      if (onChange) onChange(overwriteOption)
    }
  }, [overwriteOption])

  const backgroundImage = useMemo(() => {
    return `linear-gradient(90deg, ${gradient
      .map((color, i) => `${color} ${(i / (gradient.length - 1)) * 100}%`)
      .join(', ')})`
  }, [gradient])

  return (
    <Box sx={{ display: 'inline-flex', zIndex: 2 }} ref={ref}>
      <Flex
        ref={selectRef}
        sx={{
          alignItems: 'center',
          mx: 2,
          px: 1,
          borderBottom: '1px solid',
          borderBottomColor: 'neutral80',
          lineHeight: 'loose',
          cursor: 'pointer',
          color: gradient ? 'transparent' : 'interactive100',
          userSelect: 'none',
          '&:hover': {
            '.withGradient': {
              backgroundPosition: `${textRef?.current?.offsetWidth}px 0`,
            },
          },
        }}
        onClick={() => {
          toggleIsOpen()
          setDropdownPosition()
        }}
      >
        <Text
          ref={textRef}
          as="span"
          className="withGradient"
          sx={
            gradient && {
              backgroundImage,
              backgroundSize: '100% 100%',
              backgroundPosition: isOpen ? `${textRef?.current?.offsetWidth}px 0` : '0 0',
              backgroundRepeat: 'no-repeat',
              backgroundColor: gradient[0],
              transition: `background-position ${(textRef?.current?.offsetWidth || 1) * 2}ms`,
              // @ts-ignore
              ...{ WebkitBackgroundClip: 'text' },
            }
          }
        >
          {valueAsLabel ? selected.value : selected.title}
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
          maxWidth: '100%',
          mt: '1.35em',
          pointerEvents: 'none',
        }}
      >
        <Flex
          ref={dropdownRef}
          sx={{
            width: '100%',
            maxWidth: '360px',
            mt: '12px',
            p: 3,
            pr:
              scrollRef.current && scrollRef.current.scrollHeight > scrollRef.current.offsetHeight
                ? 2
                : 3,
            bg: 'neutral10',
            border: '1px solid',
            borderColor: 'neutral20',
            borderRadius: 'large',
            boxShadow: 'buttonMenu',
            opacity: isOpen ? 1 : 0,
            transform: isOpen ? 'translateY(0)' : 'translateY(-5px)',
            transition: 'opacity 200ms, transform 200ms',
            fontFamily: 'body',
            lineHeight: 'body',
            letterSpacing: 0,
            textAlign: 'left',
            pointerEvents: isOpen ? 'auto' : 'none',
            zIndex: 2,
          }}
        >
          <Flex
            ref={scrollRef}
            as="ul"
            sx={{
              listStyle: 'none',
              m: 0,
              pl: 0,
              pr:
                scrollRef.current && scrollRef.current.scrollHeight > scrollRef.current.offsetHeight
                  ? 2
                  : 0,
              maxHeight: '382px',
              width: '100%',
              rowGap: 2,
              flexDirection: 'column',
              overflowY: 'auto',
              '&::-webkit-scrollbar': {
                width: '6px',
                borderRadius: 'large',
              },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: 'secondary100',
                borderRadius: 'large',
              },
              '&::-webkit-scrollbar-track': {
                backgroundColor:
                  scrollRef.current &&
                  scrollRef.current.scrollHeight > scrollRef.current.offsetHeight
                    ? 'secondary60'
                    : 'transparent',
                borderRadius: 'large',
              },
            }}
          >
            {options.map((option, i) => (
              <Flex
                key={i}
                as="li"
                sx={{
                  position: 'relative',
                  ...(!option.icon && {
                    minHeight: '52px',
                  }),
                  px: '12px',
                  py: 2,
                  borderRadius: 'medium',
                  cursor: 'pointer',
                  transition: 'background-color 200ms',
                  alignItems: 'center',
                  bg: selected.value === option.value ? 'neutral30' : 'transparent',
                  '&:hover': {
                    bg: 'neutral30',
                    svg: {
                      opacity: 1,
                    },
                  },
                }}
                onClick={() => {
                  setIsOpen(false)
                  setSelected(option)
                  if (onChange) onChange(option)
                }}
              >
                {option.icon && (
                  <Icon
                    size={36}
                    sx={{
                      flexShrink: 0,
                      mr: 3,
                    }}
                    name={Array.isArray(option.icon) ? option.icon[0] : option.icon}
                  />
                )}
                {Array.isArray(option.icon) && (
                  <Icon
                    size={36}
                    sx={{
                      position: 'absolute',
                      top: 0,
                      bottom: 0,
                      m: 'auto',
                      opacity: selected.value === option.value ? 1 : 0,
                      transition: '200ms opacity',
                      transform: 'scale(1.05)',
                    }}
                    name={option.icon[1]}
                  />
                )}
                <Flex sx={{ flexDirection: 'column' }}>
                  <Text as="span" sx={{ fontSize: withHeaders ? 3 : 2, fontWeight: 'semiBold' }}>
                    {option.title}
                  </Text>
                  {option.description && (
                    <Text as="span" sx={{ fontSize: 2 }}>
                      {option.description}
                    </Text>
                  )}
                </Flex>
              </Flex>
            ))}
          </Flex>
        </Flex>
      </Flex>
    </Box>
  )
}
