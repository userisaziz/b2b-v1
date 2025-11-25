import { useState, useRef, useEffect } from "react";
import type { KeyboardEvent } from "react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface AutocompleteOption {
  value: string;
  label: string;
}

interface AutocompleteProps {
  options: AutocompleteOption[];
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function Autocomplete({
  options,
  value,
  onValueChange,
  placeholder = "Search...",
  className
}: AutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [filteredOptions, setFilteredOptions] = useState<AutocompleteOption[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Set input value based on selected value
  useEffect(() => {
    const selectedOption = options.find(option => option.value === value);
    setInputValue(selectedOption ? selectedOption.label : "");
  }, [value, options]);

  // Filter options based on input
  useEffect(() => {
    if (inputValue === "") {
      setFilteredOptions(options.filter(option => option.value !== value && option.value.trim() !== ""));
    } else {
      const filtered = options.filter(
        option => 
          option.value !== value && 
          option.label.toLowerCase().includes(inputValue.toLowerCase()) &&
          option.value.trim() !== ""
      );
      setFilteredOptions(filtered);
    }
    setHighlightedIndex(-1);
  }, [inputValue, options, value]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    setIsOpen(true);
    onValueChange(""); // Clear selection when typing
  };

  const handleInputFocus = () => {
    setIsOpen(true);
  };

  const handleOptionSelect = (option: AutocompleteOption) => {
    setInputValue(option.label);
    onValueChange(option.value);
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const handleClear = () => {
    setInputValue("");
    onValueChange("");
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) {
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < filteredOptions.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case "Enter":
        e.preventDefault();
        if (highlightedIndex >= 0 && filteredOptions[highlightedIndex]) {
          handleOptionSelect(filteredOptions[highlightedIndex]);
        }
        break;
      case "Escape":
        setIsOpen(false);
        break;
    }
  };

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <div className="relative">
        <Input
          ref={inputRef}
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="pr-10"
        />
        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            ×
          </button>
        )}
      </div>

      {isOpen && filteredOptions.length > 0 && (
        <Card className="absolute top-full left-0 right-0 mt-1 z-50 max-h-60 overflow-y-auto">
          {filteredOptions
            .filter(option => option.value && option.value.trim() !== "") // Additional safety filter
            .map((option, index) => (
              <div
                key={option.value}
                className={cn(
                  "px-3 py-2 text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground",
                  index === highlightedIndex && "bg-accent text-accent-foreground"
                )}
                onClick={() => handleOptionSelect(option)}
                onMouseEnter={() => setHighlightedIndex(index)}
              >
                {option.label}
              </div>
            ))}
        </Card>
      )}
    </div>
  );
}