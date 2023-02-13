type ButtonProps = {
  className?: string
  onClick: () => void
  disabled?: boolean
}

export function Button({ className, onClick, disabled }: ButtonProps) {
  const activeClass = disabled
    ? "bg-slate-600 text-slate-400 cursor-not-allowed"
    : "bg-blue-600"

  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={`h-12 px-4 rounded-md text-sm text-white font-medium ${activeClass} ${
        className ?? ""
      }`}
    >
      Submit
    </button>
  )
}
