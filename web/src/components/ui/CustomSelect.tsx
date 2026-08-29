"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CaretDown, Check } from "@phosphor-icons/react";

export interface CustomSelectOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

interface CustomSelectProps {
  label: string;
  options: CustomSelectOption[];
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  className?: string;
}

export const CustomSelect = ({
  label,
  options,
  value,
  onChange,
  placeholder = "Pilih...",
  className = "",
}: CustomSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className={`relative font-sans ${className}`}>
      {/* Outer Field Box dengan Floating Label Notch */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="relative bg-white border border-black/20 rounded-2xl px-4 py-2.5 cursor-pointer flex items-center justify-between shadow-2xs hover:border-[#19382B] transition-all group min-w-[180px]"
      >
        {/* Floating Label Notch */}
        {label && (
          <span className="absolute -top-2.5 left-3.5 bg-white px-1.5 text-[10px] font-bold tracking-wider text-[#111111]/60 group-hover:text-[#19382B] transition-colors pointer-events-none">
            {label}
          </span>
        )}

        {/* Selected Label */}
        <div className="flex items-center gap-2 overflow-hidden mr-2">
          {selectedOption?.icon}
          <span className="text-xs font-bold text-[#111111] truncate">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>

        {/* Chevron Icon */}
        <CaretDown
          size={15}
          weight="bold"
          className={`text-[#111111]/70 group-hover:text-[#19382B] shrink-0 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </div>

      {/* Animated Dropdown Menu Container */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-black/10 rounded-2xl shadow-xl p-1.5 z-[999] max-h-60 overflow-y-auto space-y-0.5"
          >
            {options.map((option) => {
              const isSelected = option.value === value;
              return (
                <div
                  key={option.value}
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs cursor-pointer transition-colors ${
                    isSelected
                      ? "bg-gray-100 text-[#111111] font-bold"
                      : "text-[#111111]/80 hover:bg-gray-50 hover:text-[#111111] font-medium"
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    {option.icon}
                    <span className="truncate">{option.label}</span>
                  </div>
                  {isSelected && <Check size={14} weight="bold" className="text-[#19382B] shrink-0 ml-2" />}
                </div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
