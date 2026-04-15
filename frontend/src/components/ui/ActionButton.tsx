import { Loader2 } from 'lucide-react'

export interface ActionButtonProps {
  onClick: () => void
  disabled?: boolean
  isLoading?: boolean
  children: React.ReactNode
}

export function ActionButton({ onClick, disabled, isLoading, children }: ActionButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || isLoading}
      className="btn-primary w-full sm:w-auto min-w-[280px] h-14 text-lg"
    >
      {isLoading ? (
        <>
          <Loader2 className="w-6 h-6 animate-spin" />
          Đang xử lý...
        </>
      ) : (
        children
      )}
    </button>
  )
}
