import { CheckIcon, ChevronDownIcon } from 'lucide-react';
import { useState } from 'react';
import { FieldValues, UseControllerProps } from 'react-hook-form';


import { cn } from '@/lib/utils';

import { Button } from '../ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '../ui/command';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { ScrollArea } from '../ui/scroll-area';


export interface ComboboxFormFieldProps<ItemType, T extends FieldValues> {
  controllerProps: UseControllerProps<T>;
  label: string;
  placeholder?: string;
  required?: boolean;
  loading?: boolean;
  disabled?: boolean;
  items: ItemType[];
  find: (item: ItemType, value: string) => boolean;
  filter: (item: ItemType, query: string) => boolean;
  children: (item: ItemType) => { label: string; value: string };
  disableNoSelection?: boolean;
  actions?: { label: string; onClick: () => void, icon?: React.ReactNode }[];
  searchPlaceholder?: string;
  valueModifierOnChange?: (item: string) => string | number;
}

export function ComboboxFormField<ItemType, T extends FieldValues>({
  controllerProps,
  label,
  items,
  children,
  disabled,
  required,
  filter,
  loading,
  placeholder,
  find,
  actions,
  disableNoSelection,
  searchPlaceholder,
  valueModifierOnChange,
}: ComboboxFormFieldProps<ItemType, T>) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');

  const filteredItems = query === '' ? items : items.filter((item) => filter(item, query));

  return (
    <FormField
      {...controllerProps}
      render={({ field }) => {
        const item = field.value ? items.find((item) => find(item, field.value)) : undefined;

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
                    <span className={cn('flex-1 truncate text-left font-normal', !item && 'text-muted-foreground')}>
                      {item ? children(item).label : loading ? 'Cargando...' : placeholder}
                    </span>
                    <ChevronDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>

              <PopoverContent className="popover-content-width-same-as-its-trigger p-0">
                <Command shouldFilter={false}>
                  <CommandInput value={query} onValueChange={setQuery} placeholder={searchPlaceholder} />
                  <CommandEmpty>{'No hay resultados'}</CommandEmpty>

                  <ScrollArea className="max-h-[300px] overflow-y-auto" type="always">
                    <CommandGroup>
                      <CommandList>
                        {!disableNoSelection && (
                          <CommandItem
                            onSelect={() => {
                              field.onChange(null);
                              setIsOpen(false);
                            }}
                          >
                            <CheckIcon className={cn('mr-2 h-4 w-4', false ? 'opacity-100' : 'opacity-0')} />
                            {'Sin selección'}
                          </CommandItem>
                        )}

                        {filteredItems.map((item) => {
                          const { value, label } = children(item);
                          const isSelected = field.value === value;

                          return (
                            <CommandItem
                              key={value}
                              value={value}
                              onSelect={() => {
                                if (disableNoSelection) {
                                  if (valueModifierOnChange) {
                                    field.onChange(value === 'none' ? null : valueModifierOnChange(value));
                                  } else {
                                    field.onChange(value === 'none' ? null : value);
                                  }
                                } else {
                                  field.onChange(isSelected ? null : value);
                                }

                                setIsOpen(false);
                              }}
                            >
                              <CheckIcon className={cn('mr-2 h-4 w-4', isSelected ? 'opacity-100' : 'opacity-0')} />
                              {label}
                            </CommandItem>
                          );
                        })}

                        {actions?.map((item, i) => {

                          return (
                            <CommandItem
                              key={`${item.label}-${i}`}
                              value={`-1`}
                              onSelect={() => {
                                item.onClick?.()
                              }}
                            >
                              {item.icon}
                              {item.label}
                            </CommandItem>
                          );
                        })}
                      </CommandList>
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
