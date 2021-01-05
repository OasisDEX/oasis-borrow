import React, { useContext, useState } from 'react'
import * as ReactDOM from 'react-dom'

export type ModalComponent = React.FunctionComponent<ModalProps>

export interface WithClose {
  close: () => void
}

export type ModalProps<T = any> = T & WithClose

export interface Modal {
  modalComponent: ModalComponent
  modalComponentProps?: any
}

export type ModalOpener = (modal: ModalComponent, modalComponentProps?: any) => void

const ModalContext = React.createContext<ModalOpener>(() => {
  console.warn('ModalContext not setup properly ')
})

export function ModalProvider(props: { children?: React.ReactNode }) {
  const [TheModal, setModal] = useState<Modal>()

  function close() {
    setModal(undefined)
  }
  return (
    <ModalContext.Provider
      value={(modal: ModalComponent, modalProps?: any) => {
        setModal({
          modalComponent: modal,
          modalComponentProps: modalProps,
        })
      }}
    >
      {props.children}
      {TheModal &&
        ReactDOM.createPortal(
          <TheModal.modalComponent {...{ close, ...TheModal.modalComponentProps }} />,
          document.body,
        )}
    </ModalContext.Provider>
  )
}

export function useModal(): ModalOpener {
  return useContext(ModalContext)
}
