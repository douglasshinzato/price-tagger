import { LabelOrder } from './label-order'

export interface OrderModalProps {
  order: LabelOrder
  isOpen: boolean
  onClose: () => void
}