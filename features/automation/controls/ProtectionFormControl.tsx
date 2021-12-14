import { useCallback, useState } from 'react'
import React from 'react'

import { ProtectionFormLayout } from './ProtectionFormLayout'

interface Props {
  adjustForm: JSX.Element
  cancelForm: JSX.Element
}

export enum Forms {
  ADJUST,
  CANCEL,
}

export function ProtectionFormControl({ adjustForm, cancelForm }: Props) {
  const [currentForm, setForm] = useState(Forms.ADJUST)

  const toggleForms = useCallback(() => {
    setForm(currentForm === Forms.ADJUST ? Forms.CANCEL : Forms.ADJUST)
  }, [currentForm])

  return (
    <ProtectionFormLayout currentForm={currentForm} toggleForm={toggleForms}>
      {currentForm === Forms.ADJUST ? adjustForm : cancelForm}
    </ProtectionFormLayout>
  )
}
