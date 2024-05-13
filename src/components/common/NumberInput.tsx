import {
  Input,
  InputProps
} from '@chakra-ui/react'
import { useCallback, useMemo } from 'react'

export interface ConversionOptions {
    allowNegative?: boolean
    allowDecimal?: boolean
}

export interface NumberInputProps extends Omit<InputProps, 'onChange'>, ConversionOptions {
  value?: string | number,
  required?: boolean,
  disabled?: boolean,
  onChange: (value: string) => void,
}

export default function NumberInput({
  value,
  required,
  onChange,
  disabled,
  allowNegative,
  allowDecimal,
  ...rest }: NumberInputProps) {
  const opts = useMemo(() => ({ allowNegative, allowDecimal }), [allowNegative, allowDecimal])

  const onNumberChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = toNumeric(event.target.value, opts) || value?.toString() || ''
    onChange(newValue)
  }, [value, opts, onChange])

  return (
    <Input
      {...rest}
      type='text'
      value={value !== undefined ? value : ''}
      onChange={onNumberChange}
      required={required}
      disabled={disabled}/>
  )
}

const toNumeric = (
  value: string,
  opts: ConversionOptions = { allowNegative: true, allowDecimal: true }) => {
  const { allowNegative, allowDecimal } = opts

  if (value === '0-') value = '-'
  value = value.replace(',', '.')

  const regex = new RegExp(
    `^${allowNegative ? '-?' : ''}(?:\\d+${allowDecimal ? '(\\.\\d*)?' : ''}|)$`)
  if (value.length > 0 && !value.match(regex)) return

  if (value.length === 0) {
    value = '0'
  } else if (value.length > 1 && value.startsWith('0')) {
    // If decimals are not allowed, remove leading zeros
    if (!allowDecimal) {
      value = value.replace(/^0+/, '')
    } else {
      // If decimals are allowed, ensure '0.' is retained
      if (!value.startsWith('0.')) {
        value = value.slice(1) // Remove leading zero
      }
    }
  }

  return value
}
