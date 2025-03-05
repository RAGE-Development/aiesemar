import React, { useRef } from 'react'
import { Input } from '../ui/input'


export function DebouncedInput({
  value: initialValue,
  onChange,
  debounce = 500,
  omitInitialDebounce = false,
  ...props
}: {
  value: string | number
  onChange: (value: string | number) => void
  debounce?: number,
  omitInitialDebounce?: boolean
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'>) {
  const [value, setValue] = React.useState(initialValue)
  const debounceCount = useRef<number>(0)

  React.useEffect(() => {
    const timeout = setTimeout(() => {
      if (debounceCount.current === 0 && omitInitialDebounce) {
        debounceCount.current += 1
        return
      }
      onChange(value)
    }, debounce)

    return () => clearTimeout(timeout)
  }, [value, debounce, omitInitialDebounce, onChange])

  return (
    <Input {...props} value={value} onChange={e => setValue(e.target.value)} />
  )
}