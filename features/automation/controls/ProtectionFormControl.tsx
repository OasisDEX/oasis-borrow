import { useCallback, useState } from 'react'
import React from 'react'

import { ProtectionFormLayout } from './ProtectionFormLayout'

interface Props {
  adjustForm: JSX.Element
  cancelForm: JSX.Element
}

export enum ProtectionForms {
  ADJUST,
  CANCEL,
}

export function ProtectionFormControl({ adjustForm, cancelForm }: Props) {
  const [currentForm, setForm] = useState(ProtectionForms.ADJUST)

  const toggleForms = useCallback(() => {
    setForm((prevState) =>
      prevState === ProtectionForms.ADJUST ? ProtectionForms.CANCEL : ProtectionForms.ADJUST,
    )
  }, [currentForm])

  return (
    <ProtectionFormLayout currentForm={currentForm} toggleForm={toggleForms}>
      {currentForm === ProtectionForms.ADJUST ? adjustForm : cancelForm}
    </ProtectionFormLayout>
  )
}
