'use client';

import { enUS, es } from 'date-fns/locale';
import Cookies from 'js-cookie';
import moment from 'moment';
import { useMemo } from 'react';
import { FieldValues, UseControllerProps } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { CalendarIcon } from 'lucide-react';


export interface DayPickerFormFieldProps<T extends FieldValues> {
  controllerProps: UseControllerProps<T>;
  label: string;
  description?: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  hidden?: boolean;
}

export function DayPickerFormField<T extends FieldValues>({
  controllerProps,
  label,
  description,
  placeholder,
  disabled,
  required,
  hidden,
}: DayPickerFormFieldProps<T>) {
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
                  {field.value ? moment(field.value, 'Do').format('Do') : <span>{placeholder}</span>}
                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                </Button>
              </FormControl>
            </PopoverTrigger>

            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                locale={localeParsed}
                mode="single"
                selected={moment(field.value, 'Do').toDate()}
                onSelect={(value: Date | undefined) => {
                  field.onChange(value ? moment(value).date() : 1)
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
