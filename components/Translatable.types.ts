export type TranslatableType =
  | string
  | {
      key: string
      props?: { [key: string]: string }
    }

export interface TranslatableProps {
  text: TranslatableType
}
