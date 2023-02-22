export interface AjnaTxData {
  data: string
  to: string
  value: string
}

export interface AjnaValidationItem {
  name: string
  data?: { [key: string]: string }
}

export interface AjnaSimulationData<P> {
  position: P
  swap: any[]
  errors: AjnaValidationItem[]
  warnings: AjnaValidationItem[]
}

// TODO use Strategy<AjnaPosition> from library once exported
export interface AjnaActionData<P> {
  simulation: AjnaSimulationData<P>
  tx: AjnaTxData
}
