'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

const COMMON_DIETARY_OPTIONS = [
  'Vegetarian',
  'Vegan',
  'Gluten-free',
  'Dairy-free',
  'Halal',
  'Kosher',
  'Nut allergy',
  'Shellfish allergy',
  'No beef',
  'No pork',
  'Pescatarian',
  'Low FODMAP',
];

interface DietaryComboboxProps {
  name: string;
  id: string;
  defaultValue?: string;
}

/**
 * Parse stored value (comma-separated string) to array
 */
function parseValue(value: string): string[] {
  if (!value) return [];
  return value
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

/**
 * Serialize array to comma-separated string for storage
 */
function serializeValue(values: string[]): string {
  return values.join(', ');
}

export default function DietaryCombobox({
  name,
  id,
  defaultValue,
}: DietaryComboboxProps) {
  const [selectedItems, setSelectedItems] = useState<string[]>(() =>
    parseValue(defaultValue || '')
  );
  const [inputValue, setInputValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter options based on input
  const filteredOptions = COMMON_DIETARY_OPTIONS.filter(
    (option) =>
      option.toLowerCase().includes(inputValue.toLowerCase()) &&
      !selectedItems.some((item) => item.toLowerCase() === option.toLowerCase())
  );

  // Check if we should show "Add custom" option
  const showAddCustom =
    inputValue.trim() &&
    !COMMON_DIETARY_OPTIONS.some(
      (o) => o.toLowerCase() === inputValue.trim().toLowerCase()
    ) &&
    !selectedItems.some(
      (s) => s.toLowerCase() === inputValue.trim().toLowerCase()
    );

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setHighlightedIndex(-1);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const addItem = useCallback((item: string) => {
    const trimmed = item.trim();
    if (trimmed && !selectedItems.some((s) => s.toLowerCase() === trimmed.toLowerCase())) {
      setSelectedItems((prev) => [...prev, trimmed]);
    }
    setInputValue('');
    setHighlightedIndex(-1);
    inputRef.current?.focus();
  }, [selectedItems]);

  const removeItem = useCallback((item: string) => {
    setSelectedItems((prev) => prev.filter((s) => s !== item));
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      const totalOptions = filteredOptions.length + (showAddCustom ? 1 : 0);

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setIsOpen(true);
        setHighlightedIndex((prev) =>
          prev < totalOptions - 1 ? prev + 1 : 0
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev > 0 ? prev - 1 : totalOptions - 1
        );
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (highlightedIndex >= 0) {
          if (highlightedIndex < filteredOptions.length) {
            addItem(filteredOptions[highlightedIndex]);
          } else if (showAddCustom) {
            addItem(inputValue);
          }
        } else if (inputValue.trim()) {
          // Add custom item or first matching option
          if (filteredOptions.length > 0) {
            addItem(filteredOptions[0]);
          } else {
            addItem(inputValue);
          }
        }
      } else if (e.key === 'Backspace' && !inputValue && selectedItems.length > 0) {
        removeItem(selectedItems[selectedItems.length - 1]);
      } else if (e.key === 'Escape') {
        setIsOpen(false);
        setHighlightedIndex(-1);
      }
    },
    [filteredOptions, highlightedIndex, inputValue, selectedItems, showAddCustom, addItem, removeItem]
  );

  return (
    <div ref={containerRef} className="relative">
      {/* Hidden input for form submission */}
      <input type="hidden" name={name} value={serializeValue(selectedItems)} />

      {/* Tags and input container */}
      <div
        className="min-h-[42px] px-3 py-2 border border-border rounded-md focus-within:ring-2 focus-within:ring-cyan focus-within:border-transparent bg-white flex flex-wrap gap-2 items-center cursor-text"
        onClick={() => inputRef.current?.focus()}
      >
        {selectedItems.map((item) => (
          <span
            key={item}
            className="inline-flex items-center gap-1 px-2 py-1 bg-light text-sm text-navy rounded-md"
          >
            {item}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                removeItem(item);
              }}
              className="text-muted hover:text-red-500 transition-colors"
              aria-label={`Remove ${item}`}
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          type="text"
          id={id}
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setIsOpen(true);
            setHighlightedIndex(-1);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={selectedItems.length === 0 ? 'Type to search or add...' : ''}
          className="flex-1 min-w-[120px] outline-none text-sm bg-transparent"
          autoComplete="off"
        />
      </div>

      {/* Dropdown */}
      {isOpen && (filteredOptions.length > 0 || showAddCustom) && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-border rounded-md shadow-lg max-h-60 overflow-auto">
          {filteredOptions.map((option, index) => (
            <button
              key={option}
              type="button"
              onClick={() => addItem(option)}
              className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                index === highlightedIndex
                  ? 'bg-cyan/10 text-navy'
                  : 'text-body hover:bg-light'
              }`}
            >
              {option}
            </button>
          ))}
          {showAddCustom && (
            <>
              {filteredOptions.length > 0 && (
                <div className="border-t border-border" />
              )}
              <button
                type="button"
                onClick={() => addItem(inputValue)}
                className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                  highlightedIndex === filteredOptions.length
                    ? 'bg-cyan/10 text-navy'
                    : 'text-body hover:bg-light'
                }`}
              >
                <span className="text-muted">Add:</span>{' '}
                <span className="font-medium">&ldquo;{inputValue.trim()}&rdquo;</span>
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
