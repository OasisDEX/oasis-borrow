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

export interface ModalState {
  openModal: ModalOpener
  closeModal: () => void
  modal: Modal | undefined
}

const ModalContext = React.createContext<ModalState>({
  openModal: () => {
    console.warn('ModalContext not setup properly ')
  },
  closeModal: () => {
    console.warn('ModalContext not setup properly ')
  },
  modal: undefined,
})

export function ModalProvider(props: { children?: React.ReactNode }) {
  const [TheModal, setModal] = useState<Modal>()

  function close() {
    setModal(undefined)
  }

  return (
    <ModalContext.Provider
      value={{
        openModal: (modal, modalProps) => {
          setModal({
            modalComponent: modal,
            modalComponentProps: modalProps,
          })
        },
        closeModal: close,
        modal: TheModal,
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

/**
 * @deprecated use useModalContext instead. This is only here for backwards compatibility. New hook contains handler for closing and reference for actual modal.
 */
export function useModal(): ModalOpener {
  return useContext(ModalContext).openModal
}

export function useModalContext(): ModalState {
  return useContext(ModalContext)
}
