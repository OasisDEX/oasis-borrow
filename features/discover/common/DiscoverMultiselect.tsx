import { Icon } from '@makerdao/dai-ui-icons'
import { ExpandableArrow } from 'components/dumb/ExpandableArrow'
import { GenericSelectOption } from 'components/GenericSelect'
import { useOutsideElementClickHandler } from 'helpers/useOutsideElementClickHandler'
import { useToggle } from 'helpers/useToggle'
import React, { useEffect, useState } from 'react'
import { Box, Text } from 'theme-ui'

export function DiscoverMultiselect({ options }: { options: GenericSelectOption[] }) {
  const [values, setValues] = useState<string[]>([])
  const [isOpen, toggleIsOpen, setIsOpen] = useToggle(false)
  const ref = useOutsideElementClickHandler(() => setIsOpen(false))

  useEffect(() => {
    console.log(values)
  }, [values])

  return (
    <Box sx={{ position: 'relative', zIndex: 2 }} ref={ref}>
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
          zIndex: 2,
          '&:hover': {
            borderColor: isOpen ? 'primary100' : 'neutral70',
          },
        }}
        onClick={toggleIsOpen}
      >
        <Text
          as="span"
          sx={{
            display: 'block',
            fontSize: 2,
            fontWeight: 'semiBold',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          AAVE, ETH, LINK, MATIC, MATIC, WBTC
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
          zIndex: 3,
        }}
      >
        {options.map((option) => (
          <DiscoverMultiselectItem
            key={option.value}
            {...option}
            onClick={(value, label) => {
              if (values.includes(value)) setValues(values.filter((item) => item !== value))
              else setValues([...values, value])
            }}
          />
        ))}
      </Box>
    </Box>
  )
}

export function DiscoverMultiselectItem({
  icon,
  label,
  onClick,
  value,
}: { onClick: (value: string, label: string) => void } & GenericSelectOption) {
  return (
    <Box
      as="li"
      sx={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        py: '12px',
        pr: 3,
        pl: '48px',
        fontSize: 3,
        transition: 'background-color 200ms',
        cursor: 'pointer',
        '&:hover': {
          backgroundColor: 'neutral30',
        },
      }}
      onClick={() => onClick(value, label)}
    >
      <Icon
        size={14}
        sx={{ position: 'absolute', top: 0, bottom: 0, left: '20px', margin: 'auto' }}
        name="tick"
        color="neutral80"
      />
      {icon && <Icon size={32} sx={{ flexShrink: 0, mr: '12px' }} name={icon} />}
      {label}
    </Box>
  )
}
