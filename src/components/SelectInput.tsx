"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface SelectInputProps<T> {
  data: T[];
  value: string;
  onChange: (value: string) => void;
  valueKey: keyof T;
  labelKey: keyof T;
  secondaryLabelKey?: keyof T;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  disabled?: boolean;
  className?: string;
}

export function SelectInput<T extends Record<string, any>>({
  data,
  value,
  onChange,
  valueKey,
  labelKey,
  secondaryLabelKey,
  placeholder = "Select...",
  searchPlaceholder = "Search...",
  emptyText = "No data found.",
  disabled = false,
  className,
}: SelectInputProps<T>) {
  const [open, setOpen] = React.useState(false);

  const selectedItem = data.find((item) => item[valueKey] === value);

  const getDisplayLabel = (item: T) => {
    const primary = item[labelKey];
    const secondary = secondaryLabelKey ? item[secondaryLabelKey] : null;
    
    if (secondary) {
      return `${primary} (${secondary})`;
    }
    return primary;
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", className)}
          disabled={disabled}
        >
          {selectedItem ? (
            <span>{getDisplayLabel(selectedItem)}</span>
          ) : (
            <span className="text-gray-500">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandEmpty>{emptyText}</CommandEmpty>
          <CommandGroup className="max-h-64 overflow-y-auto">
            {data.map((item, index) => {
              const itemValue = item[valueKey];
              const searchValue = getDisplayLabel(item);

              return (
                <CommandItem
                  key={`${itemValue}-${index}`}
                  value={searchValue}
                  onSelect={() => {
                    onChange(itemValue);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === itemValue ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <span>{getDisplayLabel(item)}</span>
                </CommandItem>
              );
            })}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}