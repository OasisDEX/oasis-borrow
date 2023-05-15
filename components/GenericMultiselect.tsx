import { Icon } from '@makerdao/dai-ui-icons'
import { ExpandableArrow } from 'components/dumb/ExpandableArrow'
import { toggleArrayItem } from 'helpers/toggleArrayItem'
import { useOutsideElementClickHandler } from 'helpers/useOutsideElementClickHandler'
import { useToggle } from 'helpers/useToggle'
import { useTranslation } from 'next-i18next'
import React, { ReactNode, useEffect, useRef, useState } from 'react'
import { Box, Flex, Image, Text } from 'theme-ui'

export interface GenericMultiselectOption {
  icon?: string
  image?: string
  label: string
  value: string
}

export interface GenericMultiselectProps {
  label: string
  options: GenericMultiselectOption[]
  onChange: (value: string[]) => void
}

export function GenericMultiselect({ label, options, onChange }: GenericMultiselectProps) {
  const { t } = useTranslation()

  const didMountRef = useRef(false)
  const [values, setValues] = useState<string[]>([])
  const [isOpen, toggleIsOpen, setIsOpen] = useToggle(false)
  const outsideRef = useOutsideElementClickHandler(() => setIsOpen(false))
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (didMountRef.current) onChange(values.length ? values : options.map((item) => item.value))
    else didMountRef.current = true
  }, [values])

  function getSelectLabel(): ReactNode {
    switch (values.length) {
      case 0:
        return `${t('all')} ${label.toLowerCase()}`
      case 1:
        const selected = options.filter((item) => item.value === values[0])[0]
        return (
          <>
            {selected.icon && (
              <Icon size={32} sx={{ flexShrink: 0, mr: '12px' }} name={selected.icon} />
            )}
            {selected.label}
          </>
        )
      default:
        return `${t('selected')} ${label.toLowerCase()}: ${values.length}`
    }
  }

  return (
    <Box sx={{ position: 'relative', userSelect: 'none' }} ref={outsideRef}>
      <Box
        sx={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          height: '56px',
          pr: '42px',
          pl: 3,
          border: '1px solid',
          borderColor: isOpen ? 'primary100' : 'secondary100',
          borderRadius: 'medium',
          backgroundColor: 'neutral10',
          cursor: 'pointer',
          transition: 'border-color 200ms',
          '&:hover': {
            borderColor: isOpen ? 'primary100' : 'neutral70',
          },
        }}
        onClick={toggleIsOpen}
      >
        <Text
          as="span"
          sx={{
            display: 'flex',
            alignItems: 'center',
            fontSize: 2,
            fontWeight: 'semiBold',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {getSelectLabel()}
          <ExpandableArrow
            size={12}
            direction={isOpen ? 'up' : 'down'}
            sx={{
              position: 'absolute',
              top: 0,
              right: '18px',
              bottom: 0,
              my: 'auto',
            }}
          />
        </Text>
      </Box>
      <Box
        sx={{
          position: 'absolute',
          top: '100%',
          left: 0,
          minWidth: '100%',
          mt: 1,
          p: '12px',
          border: '1px solid',
          borderColor: 'secondary100',
          borderRadius: 'large',
          backgroundColor: 'neutral10',
          boxShadow: 'buttonMenu',
          opacity: isOpen ? 1 : 0,
          transform: isOpen ? 'translateY(0)' : 'translateY(-5px)',
          pointerEvents: isOpen ? 'auto' : 'none',
          transition: 'opacity 200ms, transform 200ms',
        }}
      >
        <Flex
          ref={scrollRef}
          as="ul"
          sx={{
            flexDirection: 'column',
            rowGap: 2,
            maxHeight: '340px',
            pl: 0,
            pr:
              scrollRef.current && scrollRef.current.scrollHeight > scrollRef.current.offsetHeight
                ? '12px'
                : 0,
            overflowY: 'auto',
            zIndex: 1,
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
                scrollRef.current && scrollRef.current.scrollHeight > scrollRef.current.offsetHeight
                  ? 'secondary60'
                  : 'transparent',
              borderRadius: 'large',
            },
          }}
        >
          <GenericMultiselectItem
            hasCheckbox={false}
            isDisabled={values.length === 0}
            label={t('clear-selection')}
            onClick={() => {
              setValues([])
              setIsOpen(false)
            }}
            value=""
          />
          {options.map((option) => (
            <GenericMultiselectItem
              isSelected={values.includes(option.value)}
              key={option.value}
              onClick={(value) => setValues(toggleArrayItem<string>(values, value))}
              {...option}
            />
          ))}
        </Flex>
      </Box>
    </Box>
  )
}

export function GenericMultiselectItem({
  hasCheckbox = true,
  icon,
  image,
  isDisabled = false,
  isSelected = false,
  label,
  onClick,
  value,
}: {
  hasCheckbox?: boolean
  isDisabled?: boolean
  isSelected?: boolean
  onClick: (value: string) => void
} & GenericMultiselectOption) {
  return (
    <Box
      as="li"
      sx={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        py: '12px',
        pr: 3,
        pl: hasCheckbox ? '48px' : '16px',
        fontSize: 3,
        color: isDisabled ? 'neutral80' : 'primary100',
        borderRadius: 'medium',
        transition: 'color 200ms, background-color 200ms',
        cursor: isDisabled ? 'default' : 'pointer',
        whiteSpace: 'nowrap',
        '&:hover': {
          backgroundColor: isDisabled ? 'transparent' : 'neutral30',
        },
      }}
      onClick={() => {
        if (!isDisabled) onClick(value)
      }}
    >
      {hasCheckbox && (
        <Box
          sx={{
            position: 'absolute',
            top: '14px',
            left: '16px',
            width: '20px',
            height: '20px',
            backgroundColor: isSelected ? 'success10' : 'neutral10',
            border: '1px solid',
            borderColor: isSelected ? 'success100' : 'neutral60',
            borderRadius: 'small',
            transition: 'background-color 100ms, border-color 100ms',
          }}
        >
          <Icon
            size={10}
            sx={{
              position: 'absolute',
              top: 0,
              right: 0,
              bottom: 0,
              left: 0,
              margin: 'auto',
              opacity: isSelected ? 1 : 0,
              transition: 'opacity 100ms',
            }}
            name="checkmark"
            color="success100"
          />
        </Box>
      )}
      {(icon || image) && (
        <Box sx={{ flexShrink: 0, my: '-4px', mr: '12px', ...(image && { p: '3px' }) }}>
          {icon && <Icon size={32} name={icon} sx={{ verticalAlign: 'bottom' }} />}
          {image && (
            <Image
              src={image}
              alt={label}
              sx={{ width: '26px', height: '26px', verticalAlign: 'bottom' }}
            />
          )}
        </Box>
      )}
      {label}
    </Box>
  )
}
