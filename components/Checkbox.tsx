import { Icon } from '@makerdao/dai-ui-icons'
import type { FC, MouseEventHandler } from 'react'
import React from 'react'
import { Flex } from 'theme-ui'

interface CheckboxProps {
  checked: boolean
  onClick: MouseEventHandler<HTMLDivElement>
}

export const Checkbox: FC<CheckboxProps> = ({ checked, onClick }) => (
  <Flex
    onClick={onClick}
    sx={{
      border: '1px solid',
      borderColor: checked ? 'success100' : 'lavender_o25',
      backgroundColor: checked ? 'success10' : 'neutral10',
      width: '20px',
      height: '20px',
      borderRadius: '5px',
      cursor: 'pointer',
      justifyContent: 'center',
      alignItems: 'center',
    }}
  >
    {checked && <Icon name="checkmark" color="success100" size="auto" width="12px" />}
  </Flex>
)
