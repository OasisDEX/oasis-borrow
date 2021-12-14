import { useCallback, useState } from 'react'
import React from 'react'

import { AutomationFromKind } from '../common/enums/TriggersTypes'
import { ProtectionFormLayout } from './ProtectionFormLayout'

interface Props {
  adjustForm: JSX.Element
  cancelForm: JSX.Element
}

export function ProtectionFormControl({ adjustForm, cancelForm }: Props) {
  const [currentForm, setForm] = useState(AutomationFromKind.ADJUST)

  const toggleForms = useCallback(() => {
    setForm((prevState) =>
      prevState === AutomationFromKind.ADJUST
        ? AutomationFromKind.CANCEL
        : AutomationFromKind.ADJUST,
    )
  }, [currentForm])

  return (
    <ProtectionFormLayout currentForm={currentForm} toggleForm={toggleForms}>
      {currentForm === AutomationFromKind.ADJUST ? adjustForm : cancelForm}
    </ProtectionFormLayout>
  )
}
