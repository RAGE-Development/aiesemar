import React from 'react';
import { FieldValues, UseControllerProps } from 'react-hook-form';


import { cn } from '@/lib/utils';

import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

export interface SelectFormFieldProps<ItemType, T extends FieldValues> {
  controllerProps: UseControllerProps<T>;
  label: string;
  description?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  items: ItemType[];
  disableNoSelection?: boolean;
  children: (item: ItemType) => React.ReactNode;
  valueModifierOnChange?: (item: string) => string | number;
  valueModifierOnShow?: (item: any) => string;
}

export function SelectFormField<ItemType, T extends FieldValues>({
  controllerProps,
  label,
  description,
  items,
  children,
  disableNoSelection,
  ...props
}: SelectFormFieldProps<ItemType, T>) {
  const { required, placeholder, disabled } = props;

  return (
    <FormField
      {...controllerProps}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{required ? `${label}*` : label}</FormLabel>

          <Select
            onValueChange={(value) => {
              if (!value) return;
              if (props.valueModifierOnChange) {
                field.onChange(value === 'none' ? null : props.valueModifierOnChange(value));
              } else {
                field.onChange(value === 'none' ? null : value);
              }
            }}
            value={props.valueModifierOnShow ? props.valueModifierOnShow(field.value) : field.value ?? ''}
            disabled={disabled}
            required={required}
          >
            <FormControl>
              <SelectTrigger className={cn(!field.value && 'text-muted-foreground')}>
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
            </FormControl>

            <SelectContent>
              {!disableNoSelection && <SelectItem value="none">Sin selección</SelectItem>}
              {items.map((item) => children(item))}
            </SelectContent>
          </Select>

          {description ? <FormDescription>{description}</FormDescription> : null}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
