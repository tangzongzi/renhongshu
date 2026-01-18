interface PublishButtonProps {
  onClick: () => void
  disabled?: boolean
  loading?: boolean
}

export default function PublishButton({ onClick, disabled, loading }: PublishButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className="w-full px-6 py-3 bg-gradient-to-r from-primary to-pink-400 text-white rounded-full font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? '处理中...' : '确认并发布'}
    </button>
  )
}
