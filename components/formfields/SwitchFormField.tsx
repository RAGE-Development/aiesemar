import { FieldValues, UseControllerProps, useController } from 'react-hook-form';

import { Switch } from '../ui/switch';

export interface SwitchFormFieldProps<T extends FieldValues> {
  controllerProps: UseControllerProps<T>;
  label: string;
  disabled?: boolean;
}

export function SwitchFormField<T extends FieldValues>({ controllerProps, label, ...props }: SwitchFormFieldProps<T>) {
  const { field } = useController(controllerProps);

  return (
    <label className="inline-flex flex-col gap-2">
      <span className="text-sm font-medium text-foreground">{label}</span>
      <Switch checked={field.value} onCheckedChange={field.onChange} ref={field.ref} name={field.name} {...props} />
    </label>
  );
}
