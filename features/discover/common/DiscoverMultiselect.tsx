import { Icon } from '@makerdao/dai-ui-icons'
import { ExpandableArrow } from 'components/dumb/ExpandableArrow'
import { GenericSelectOption } from 'components/GenericSelect'
import { DiscoverFiltersListItem } from 'features/discover/meta'
import { toggleArrayItem } from 'helpers/toggleArrayItem'
import { useOutsideElementClickHandler } from 'helpers/useOutsideElementClickHandler'
import { useToggle } from 'helpers/useToggle'
import { useTranslation } from 'next-i18next'
import React, { ReactNode, useEffect, useRef, useState } from 'react'
import { Box, Text } from 'theme-ui'

export function DiscoverMultiselect({
  label,
  onChange,
  options,
}: {
  onChange: (value: string) => void
} & DiscoverFiltersListItem) {
  const { t } = useTranslation()

  const didMountRef = useRef(false)
  const [values, setValues] = useState<string[]>([])
  const [isOpen, toggleIsOpen, setIsOpen] = useToggle(false)
  const ref = useOutsideElementClickHandler(() => setIsOpen(false))

  useEffect(() => {
    if (didMountRef.current)
      onChange((values.length ? values : options.map((item) => item.value)).join(','))
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
    <Box sx={{ position: 'relative', userSelect: 'none' }} ref={ref}>
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
        as="ul"
        sx={{
          position: 'absolute',
          top: '100%',
          right: 0,
          left: 0,
          maxHeight: '340px',
          mt: 1,
          py: '12px',
          px: 0,
          border: '1px solid',
          borderColor: 'secondary100',
          borderRadius: 'large',
          backgroundColor: 'neutral10',
          boxShadow: 'buttonMenu',
          opacity: isOpen ? 1 : 0,
          transform: isOpen ? 'translateY(0)' : 'translateY(-5px)',
          pointerEvents: isOpen ? 'auto' : 'none',
          transition: 'opacity 200ms, transform 200ms',
          overflowY: 'auto',
          zIndex: 1,
        }}
      >
        <DiscoverMultiselectItem
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
          <DiscoverMultiselectItem
            isSelected={values.includes(option.value)}
            key={option.value}
            onClick={(value) => setValues(toggleArrayItem<string>(values, value))}
            {...option}
          />
        ))}
      </Box>
    </Box>
  )
}

export function DiscoverMultiselectItem({
  hasCheckbox = true,
  icon,
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
} & GenericSelectOption) {
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
        transition: 'color 200ms, background-color 200ms',
        cursor: isDisabled ? 'default' : 'pointer',
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
      {icon && <Icon size={32} sx={{ flexShrink: 0, my: '-4px', mr: '12px' }} name={icon} />}
      {label}
    </Box>
  )
}
