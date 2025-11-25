import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, ChevronDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface MultiSelectOption {
  value: string;
  label: string;
}

interface MultiSelectProps {
  options: MultiSelectOption[];
  value: string[];
  onValueChange: (value: string[]) => void;
  placeholder?: string;
  className?: string;
}

export function MultiSelect({
  options,
  value,
  onValueChange,
  placeholder = "Select options...",
  className
}: MultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [filteredOptions, setFilteredOptions] = useState<MultiSelectOption[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter options based on input and already selected values
  useEffect(() => {
    const filtered = options.filter(
      option => 
        !value.includes(option.value) && 
        option.label.toLowerCase().includes(inputValue.toLowerCase())
    );
    setFilteredOptions(filtered);
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
  };

  const handleInputFocus = () => {
    setIsOpen(true);
  };

  const handleOptionSelect = (option: MultiSelectOption) => {
    const newValue = [...value, option.value];
    onValueChange(newValue);
    setInputValue("");
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const handleRemoveValue = (valueToRemove: string) => {
    const newValue = value.filter(v => v !== valueToRemove);
    onValueChange(newValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
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
      case "Backspace":
        if (inputValue === "" && value.length > 0) {
          // Remove the last selected value
          const newValue = [...value];
          newValue.pop();
          onValueChange(newValue);
        }
        break;
    }
  };

  // Get labels for selected values
  const selectedLabels = value.map(val => {
    const option = options.find(opt => opt.value === val);
    return option ? option.label : val;
  });

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <div 
        className={cn(
          "border border-input rounded-md p-2 min-h-10 cursor-text bg-background",
          "focus-within:ring-2 focus-within:ring-ring focus-within:border-ring",
          "transition-colors duration-200",
          isOpen && "ring-2 ring-ring border-ring"
        )}
        onClick={() => inputRef.current?.focus()}
      >
        <div className="flex flex-wrap gap-1">
          {selectedLabels.map((label, index) => (
            <div 
              key={value[index]} 
              className="bg-primary text-primary-foreground rounded-md px-2 py-1 text-sm flex items-center gap-1"
            >
              <span className="truncate max-w-xs">{label}</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveValue(value[index]);
                }}
                className="rounded-full hover:bg-primary-foreground/20 p-0.5 transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
          <div className="flex-1 flex items-center">
            <input
              ref={inputRef}
              value={inputValue}
              onChange={handleInputChange}
              onFocus={handleInputFocus}
              onKeyDown={handleKeyDown}
              placeholder={value.length === 0 ? placeholder : ""}
              className="flex-1 min-w-20 outline-none bg-transparent border-none"
            />
            <ChevronDown 
              className={cn(
                "h-4 w-4 text-muted-foreground transition-transform duration-200",
                isOpen && "rotate-180"
              )} 
            />
          </div>
        </div>
      </div>

      {isOpen && (
        <Card className="absolute top-full left-0 right-0 mt-1 z-50 max-h-60 overflow-hidden shadow-lg border border-border">
          {filteredOptions.length > 0 ? (
            <div className="max-h-60 overflow-y-auto">
              {filteredOptions.map((option, index) => (
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
            </div>
          ) : (
            <div className="px-3 py-2 text-sm text-muted-foreground">
              No options found
            </div>
          )}
        </Card>
      )}
    </div>
  );
}