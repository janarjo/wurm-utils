import {
  Input,
  InputProps } from '@chakra-ui/react'
import { useCallback, useEffect, useMemo, useState } from 'react'

export interface ConversionOptions {
    allowNegative?: boolean
    allowDecimal?: boolean
}

export interface NumberInputProps extends InputProps, ConversionOptions {
  value?: string | number,
  required?: boolean,
}

export default function NumberInput({
  value: initialValue = '0',
  required,
  onChange,
  allowNegative,
  allowDecimal,
  ...rest }: NumberInputProps) {
  const [ value, setValue ] = useState<string>(initialValue.toString())

  if (!onChange) onChange = (event) => setValue(event.target.value)

  useEffect(() => {
    setValue(initialValue.toString())
  }, [initialValue])

  const opts = useMemo(() => ({ allowNegative, allowDecimal }), [allowNegative, allowDecimal])
  const onNumberChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = toNumeric(event.target.value, opts) || value
    setValue(newValue)
    onChange({ ...event, target: { ...event.target, value: newValue } })
  }, [onChange, value, opts])

  return (
    <Input
      {...rest}
      type='text'
      value={value}
      onChange={onNumberChange}
      required={required}/>
  )
}

const toNumeric = (
  value: string,
  opts: ConversionOptions = { allowNegative: true, allowDecimal: true }) => {
  const orig = value
  const { allowNegative, allowDecimal } = opts

  if (value === '0-') value = '-'

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

  console.log(`Converted ${orig} to ${value}`)
  return value
}
