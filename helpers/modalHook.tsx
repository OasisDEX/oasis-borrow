import React, { useContext, useState } from 'react'
import * as ReactDOM from 'react-dom'

export interface WithClose {
  close?: () => void
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

type ModalOpenerWithClose = ModalOpener & WithClose

const ModalContext = React.createContext<ModalOpenerWithClose>(() => {
  console.warn('ModalContext not setup properly ')
})

export function ModalProvider(props: { children?: React.ReactNode }) {
  const [TheModal, setModal] = useState<Modal>()

  function close() {
    setModal(undefined)
  }
  const modalContextValue: ModalOpenerWithClose = (modal, modalProps) => {
    setModal({
      modalComponent: modal,
      modalComponentProps: modalProps,
    })
  }
  // Adding this to the context so that we can close the modal from anywhere
  // without having to pass the close function down the component tree
  modalContextValue.close = close
  return (
    <ModalContext.Provider value={modalContextValue}>
      {props.children}
      {TheModal &&
        ReactDOM.createPortal(
          <TheModal.modalComponent {...{ close, ...TheModal.modalComponentProps }} />,
          document.body,
        )}
    </ModalContext.Provider>
  )
}

export function useModal(): ModalOpenerWithClose {
  return useContext(ModalContext)
}
