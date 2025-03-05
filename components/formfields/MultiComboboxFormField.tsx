import { CheckIcon, ChevronDownIcon } from 'lucide-react';
import { useState } from 'react';
import { FieldValues, UseControllerProps } from 'react-hook-form';


import { cn } from '@/lib/utils';

import { Button } from '../ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '../ui/command';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { ScrollArea } from '../ui/scroll-area';

export interface MultiComboboxFormFieldProps<ItemType, T extends FieldValues> {
  controllerProps: UseControllerProps<T>;
  label: string;
  placeholder?: string;
  searchPlaceholder?: string;
  required?: boolean;
  disabled?: boolean;
  items: ItemType[];
  find: (item: ItemType, value: string) => boolean;
  filter: (item: ItemType, query: string) => boolean;
  children: (item: ItemType) => { label: string; value: string };
}

export function MultiComboboxFormField<ItemType, T extends FieldValues>({
  controllerProps,
  label,
  items,
  children,
  disabled,
  required,
  filter,
  placeholder,
  find,
  searchPlaceholder,
}: MultiComboboxFormFieldProps<ItemType, T>) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');

  const filteredItems = query === '' ? items : items.filter((item) => filter(item, query));

  return (
    <FormField
      {...controllerProps}
      render={({ field }) => {
        const values = field.value as string[];

        const labels = values.reduce((acc, v) => {
          const item = items ? items.find((item) => find(item, v)) : undefined;
          if (item) {
            acc.push(children(item).label);
          }
          return acc;
        }, [] as string[]);

        return (
          <FormItem>
            <FormLabel>{required ? `${label}*` : label}</FormLabel>

            <Popover open={isOpen} onOpenChange={setIsOpen} modal>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    disabled={disabled}
                    className="w-full"
                    variant="outline"
                    role="combobox"
                    aria-expanded={isOpen}
                  >
                    <span
                      className={cn('flex-1 truncate text-left font-normal', !labels.length && 'text-muted-foreground')}
                    >
                      {labels.length ? labels.join(', ') : placeholder}
                    </span>
                    <ChevronDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>

              <PopoverContent className="popover-content-width-same-as-its-trigger p-0">
                <Command shouldFilter={false}>
                  <CommandInput value={query} onValueChange={setQuery} placeholder={searchPlaceholder} />
                  <CommandEmpty>Sin resultados.</CommandEmpty>

                  <ScrollArea className="max-h-[300px] overflow-y-auto" type="always">
                    <CommandGroup>
                      {filteredItems.map((item) => {
                        const { value, label } = children(item);
                        const isSelected = values.includes(value);

                        return (
                          <CommandItem
                            key={value}
                            value={value}
                            onSelect={() => {
                              field.onChange(isSelected ? values.filter((v) => v !== value) : values.concat(value));
                            }}
                          >
                            <CheckIcon className={cn('mr-2 h-4 w-4', isSelected ? 'opacity-100' : 'opacity-0')} />
                            {label}
                          </CommandItem>
                        );
                      })}
                    </CommandGroup>
                  </ScrollArea>
                </Command>
              </PopoverContent>
            </Popover>

            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}
