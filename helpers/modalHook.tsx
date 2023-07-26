import React, { useContext, useState } from 'react'
import * as ReactDOM from 'react-dom'

export interface WithClose {
  close: () => void
  id?: string
}

export type ModalProps<T = any> = T & WithClose

export interface Modal {
  modalComponent: React.ComponentType
  modalComponentProps?: any
}

export type ModalOpener = <M extends React.ComponentType<any>, P extends React.ComponentProps<M>>(
  modal: M,
  modalComponentProps?: Omit<P, 'close'>,
) => void

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
      value={(modal, modalProps) => {
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
