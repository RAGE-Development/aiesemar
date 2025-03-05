import React from 'react';
import { FieldValues, UseControllerProps } from 'react-hook-form';

import { DebouncedInput } from './DebouncedInput';
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { Input } from '../ui/input';

export interface InputFormFieldProps<T extends FieldValues> extends React.ComponentProps<"input"> {
  controllerProps: UseControllerProps<T>;
  label: string;
  description?: string;
  hidden?: boolean;
  debounced?: boolean;
  debounceInterval?: number;
  valueModifierOnChange?: (item: string) => string | number;
}

export function InputFormField<T extends FieldValues>({
  controllerProps,
  label,
  description,
  hidden,
  debounced = true,
  debounceInterval = 500,
  valueModifierOnChange,
  ...props
}: InputFormFieldProps<T>) {
  const { required } = props;

  return (
    <FormField
      {...controllerProps}
      render={({ field }) => (
        <FormItem hidden={hidden}>
          <FormLabel>{required ? `${label}*` : label}</FormLabel>
          <FormControl>
            {debounced ? (
              <DebouncedInput
                {...field}
                {...props}
                omitInitialDebounce
                debounce={debounceInterval}
                value={field.value}
                onChange={(value) => {
                  if (valueModifierOnChange) {
                    field.onChange(valueModifierOnChange(value.toString()));
                  } else {
                    field.onChange(value);
                  }
                }}
              />
            ) : (
              <Input
                {...field}
                {...props}
                onChange={(e) => {
                  const value = e.target.value;
                  if (valueModifierOnChange) {
                    field.onChange(valueModifierOnChange(value));
                  } else {
                    field.onChange(value);
                  }
                }}
              />
            )}
          </FormControl>
          {description ? <FormDescription>{description}</FormDescription> : null}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
