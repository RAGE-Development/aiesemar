import React from 'react';
import { FieldValues, UseControllerProps } from 'react-hook-form';

import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { Input } from '../ui/input';

export interface PasswordFormFieldProps<T extends FieldValues> extends React.ComponentProps<"input"> {
  controllerProps: UseControllerProps<T>;
  label: string;
  description?: string;
  hidden?: boolean;
  valueModifierOnChange?: (item: string) => string | number;
}

export function PasswordFormField<T extends FieldValues>({
  controllerProps,
  label,
  description,
  hidden,
  valueModifierOnChange,
  ...props
}: PasswordFormFieldProps<T>) {
  const { required } = props;

  return (
    <FormField
      {...controllerProps}
      render={({ field }) => (
        <FormItem hidden={hidden}>
          <FormLabel>{required ? `${label}*` : label}</FormLabel>
          <FormControl>
            <Input
              type='password'
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
          </FormControl>
          {description ? <FormDescription>{description}</FormDescription> : null}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
