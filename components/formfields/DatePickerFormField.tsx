'use client';

import { enUS, es } from 'date-fns/locale';
import Cookies from 'js-cookie';
import moment from 'moment';
import { useMemo } from 'react';
import { FieldValues, UseControllerProps } from 'react-hook-form';

import { Button } from '../ui/button';
import { Calendar } from '../ui/calendar';
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { cn } from '@/lib/utils';
import { CalendarIcon } from 'lucide-react';


export interface DatePickerFormFieldProps<T extends FieldValues> {
  controllerProps: UseControllerProps<T>;
  label: string;
  description?: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  hidden?: boolean;
  zeroHour?: boolean;
}

export function DatePickerFormField<T extends FieldValues>({
  controllerProps,
  label,
  description,
  placeholder,
  disabled,
  required,
  hidden,
  zeroHour,
}: DatePickerFormFieldProps<T>) {
  const locale = Cookies.get('APP_LOCALE') || 'en';
  const localeParsed = useMemo(() => {
    switch (locale) {
      case 'en':
        return enUS
      case 'es':
        return es
      default:
        return enUS
    }

  }, [locale])

  return (
    <FormField
      {...controllerProps}
      render={({ field }) => (
        <FormItem hidden={hidden}>
          <FormLabel>
            {label}
            {required ? '*' : ''}
          </FormLabel>

          <Popover>
            <PopoverTrigger asChild>
              <FormControl>
                <Button
                  disabled={disabled}
                  variant={'outline'}
                  className={cn('w-full pl-3 text-left font-normal', !field.value && 'text-muted-foreground')}
                >
                  {field.value ? moment(field.value).format(locale === 'en' ? 'YYYY/DD/MM' : 'YYYY/MM/DD') : <span>{placeholder}</span>}
                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                </Button>
              </FormControl>
            </PopoverTrigger>

            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                locale={localeParsed}
                mode="single"
                selected={field.value}
                onSelect={(value: Date | undefined) => {
                  if (zeroHour) {
                    field.onChange(value ? moment(value).clone().utc().set({ hour: 0, minute: 0, second: 0, millisecond: 0 }).format('YYYY-MM-DD') : null)
                  } else {
                    field.onChange(value ?? null)
                  }
                }}
              />
            </PopoverContent>
          </Popover>
          {description ? <FormDescription>{description}</FormDescription> : null}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
