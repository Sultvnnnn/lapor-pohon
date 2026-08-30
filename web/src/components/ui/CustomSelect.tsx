"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
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
  const [coords, setCoords] = useState<{ top: number; left: number; width: number }>({
    top: 0,
    left: 0,
    width: 200,
  });
  const [mounted, setMounted] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    setMounted(true);
  }, []);

  const updatePosition = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setCoords({
        top: rect.bottom + window.scrollY + 6,
        left: rect.left + window.scrollX,
        width: Math.max(rect.width, 220),
      });
    }
  };

  const handleToggle = () => {
    if (!isOpen) {
      updatePosition();
    }
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (triggerRef.current && !triggerRef.current.contains(event.target as Node)) {
        const menuEl = document.getElementById(`select-portal-menu-${label.replace(/\s+/g, "-")}`);
        if (menuEl && menuEl.contains(event.target as Node)) {
          return;
        }
        setIsOpen(false);
      }
    };

    const handleScrollOrResize = () => {
      if (isOpen) {
        updatePosition();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("scroll", handleScrollOrResize, true);
    window.addEventListener("resize", handleScrollOrResize);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleScrollOrResize, true);
      window.removeEventListener("resize", handleScrollOrResize);
    };
  }, [isOpen, label]);

  return (
    <div className={`relative font-sans ${className}`}>
      {/* Outer Field Box dengan Floating Label Notch */}
      <div
        ref={triggerRef}
        onClick={handleToggle}
        className="relative bg-white border border-black/20 rounded-2xl px-3.5 py-2 cursor-pointer flex items-center justify-between shadow-2xs hover:border-[#19382B] transition-all group w-full"
      >
        {/* Floating Label Notch */}
        {label && (
          <span className="absolute -top-2.5 left-3 bg-white px-1.5 text-[10px] font-extrabold tracking-tight text-[#19382B] group-hover:text-[#19382B] transition-colors pointer-events-none z-10 whitespace-nowrap">
            {label}
          </span>
        )}

        {/* Selected Label */}
        <div className="flex items-center gap-2 overflow-hidden mr-2">
          {selectedOption?.icon}
          <span className="text-xs font-bold text-[#111111] whitespace-nowrap">
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

      {/* Portal Dropdown Menu Container (Teleported to document.body so it NEVER clips!) */}
      {mounted &&
        createPortal(
          <AnimatePresence>
            {isOpen && (
              <motion.div
                id={`select-portal-menu-${label.replace(/\s+/g, "-")}`}
                initial={{ opacity: 0, y: -6, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.98 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                style={{
                  position: "absolute",
                  top: `${coords.top}px`,
                  left: `${coords.left}px`,
                  width: `${coords.width}px`,
                  zIndex: 999999,
                }}
                className="bg-white border border-black/15 rounded-2xl shadow-2xl p-1.5 max-h-64 overflow-y-auto space-y-0.5 font-sans"
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
                          ? "bg-[#19382B] text-white font-bold"
                          : "text-[#111111] hover:bg-[#ecefe6] font-semibold"
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        {option.icon}
                        <span className="truncate">{option.label}</span>
                      </div>
                      {isSelected && <Check size={14} weight="bold" className="text-[#88d937] shrink-0 ml-2" />}
                    </div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </div>
  );
};
