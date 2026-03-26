// components/theme/ThemeModal.tsx
"use client";

import React, { useState, useEffect } from "react";
import { X, Palette, ChevronDown } from "lucide-react";
import { Theme, CreateThemeRequest, UpdateThemeRequest } from "@/types/theme";
import { useTheme } from "@/hooks/useTheme";

interface ThemeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateThemeRequest | UpdateThemeRequest) => void;
  theme?: Theme | null;
  loading: boolean;
}

export const ThemeModal: React.FC<ThemeModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  theme,
  loading,
}) => {
  const { buttonPrimaryColor } = useTheme();
  const [formData, setFormData] = useState<CreateThemeRequest>({
    name: "",
    primary_color: "#0F172A",
    secondary_color: "#F8FAFC",
    button_primary_color: "#2563EB",
    button_secondary_color: "#E2E8F0",
    primary_text_color: "#FFFFFF",
    secondary_text_color: "#94A3B8",
    primary_table_color: "#1E293B",
    secondary_table_color: "#0B1120",
    primary_card_color: "#172033",
    secondary_card_color: "#0F1624",
    sidebar_foreground: "#CBD2EE",
    sidebar_primary: "#0B1120",
    sidebar_primary_foreground: "#FFFFFF",
    sidebar_header_primary: "#1E293B",
    sidebar_header_foreground: "#FFFFFF",
    header_primary: "#FFFFFF",
    header_foreground: "#0F172A",
    is_default: false,
  });

  const [openAccordions, setOpenAccordions] = useState({
    general: true,
    buttons: false,
    text: false,
    table: false,
    card: false,
    sidebar: false,
    header: false,
  });

  const toggleAccordion = (key: keyof typeof openAccordions) => {
    setOpenAccordions((prev) => {
      const isCurrentlyOpen = prev[key];
      return {
        general: key === "general" && !isCurrentlyOpen,
        buttons: key === "buttons" && !isCurrentlyOpen,
        text: key === "text" && !isCurrentlyOpen,
        table: key === "table" && !isCurrentlyOpen,
        card: key === "card" && !isCurrentlyOpen,
        sidebar: key === "sidebar" && !isCurrentlyOpen,
        header: key === "header" && !isCurrentlyOpen,
      };
    });
  };

  useEffect(() => {
    if (theme) {
      setFormData({
        name: theme.name,
        primary_color: theme.primary_color,
        secondary_color: theme.secondary_color,
        button_primary_color: theme.button_primary_color,
        button_secondary_color: theme.button_secondary_color,
        primary_text_color: theme.primary_text_color,
        secondary_text_color: theme.secondary_text_color,
        primary_table_color: theme.primary_table_color,
        secondary_table_color: theme.secondary_table_color,
        primary_card_color: theme.primary_card_color,
        secondary_card_color: theme.secondary_card_color,
        sidebar_foreground: theme.sidebar_foreground,
        sidebar_primary: theme.sidebar_primary,
        sidebar_primary_foreground: theme.sidebar_primary_foreground,
        sidebar_header_primary: theme.sidebar_header_primary,
        sidebar_header_foreground: theme.sidebar_header_foreground,
        header_primary: theme.header_primary,
        header_foreground: theme.header_foreground,
        is_default: theme.is_default,
      });
    } else {
      setFormData({
        name: "",
        primary_color: "#0F172A",
        secondary_color: "#F8FAFC",
        button_primary_color: "#2563EB",
        button_secondary_color: "#E2E8F0",
        primary_text_color: "#FFFFFF",
        secondary_text_color: "#94A3B8",
        primary_table_color: "#1E293B",
        secondary_table_color: "#0B1120",
        primary_card_color: "#172033",
        secondary_card_color: "#0F1624",
        sidebar_foreground: "#CBD2EE",
        sidebar_primary: "#0B1120",
        sidebar_primary_foreground: "#FFFFFF",
        sidebar_header_primary: "#1E293B",
        sidebar_header_foreground: "#FFFFFF",
        header_primary: "#FFFFFF",
        header_foreground: "#0F172A",
        is_default: false,
      });
    }
  }, [theme, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Palette className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                {theme ? "Edit Theme" : "Create New Theme"}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {theme ? "Update theme settings" : "Add a new theme to your system"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Theme Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Theme Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="e.g., Dark Mode, Light Theme"
              required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* Color Accordions */}
          <div className="space-y-3">
            {/* Background Colors Accordion */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <button
                type="button"
                onClick={() => toggleAccordion("general")}
                className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <span className="text-sm font-semibold text-gray-700">Background Colors</span>
                <ChevronDown
                  className={`w-5 h-5 text-gray-600 transition-transform ${
                    openAccordions.general ? "rotate-180" : ""
                  }`}
                />
              </button>
              {openAccordions.general && (
                <div className="p-4 bg-white">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Primary Background Color
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={formData.primary_color}
                          onChange={(e) =>
                            setFormData({ ...formData, primary_color: e.target.value })
                          }
                          className="w-12 h-11 rounded-lg border border-gray-300 cursor-pointer"
                        />
                        <input
                          type="text"
                          value={formData.primary_color}
                          onChange={(e) =>
                            setFormData({ ...formData, primary_color: e.target.value })
                          }
                          placeholder="#101828"
                          className="flex-1 px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-sm"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Secondary Background Color
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={formData.secondary_color}
                          onChange={(e) =>
                            setFormData({ ...formData, secondary_color: e.target.value })
                          }
                          className="w-12 h-11 rounded-lg border border-gray-300 cursor-pointer"
                        />
                        <input
                          type="text"
                          value={formData.secondary_color}
                          onChange={(e) =>
                            setFormData({ ...formData, secondary_color: e.target.value })
                          }
                          placeholder="#FFFFFF"
                          className="flex-1 px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-sm"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Button Colors Accordion */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <button
                type="button"
                onClick={() => toggleAccordion("buttons")}
                className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <span className="text-sm font-semibold text-gray-700">Button Colors</span>
                <ChevronDown
                  className={`w-5 h-5 text-gray-600 transition-transform ${
                    openAccordions.buttons ? "rotate-180" : ""
                  }`}
                />
              </button>
              {openAccordions.buttons && (
                <div className="p-4 bg-white">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Button Primary Color
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={formData.button_primary_color}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              button_primary_color: e.target.value,
                            })
                          }
                          className="w-12 h-11 rounded-lg border border-gray-300 cursor-pointer"
                        />
                        <input
                          type="text"
                          value={formData.button_primary_color}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              button_primary_color: e.target.value,
                            })
                          }
                          placeholder="#7F56D9"
                          className="flex-1 px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-sm"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Button Secondary Color
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={formData.button_secondary_color}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              button_secondary_color: e.target.value,
                            })
                          }
                          className="w-12 h-11 rounded-lg border border-gray-300 cursor-pointer"
                        />
                        <input
                          type="text"
                          value={formData.button_secondary_color}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              button_secondary_color: e.target.value,
                            })
                          }
                          placeholder="#F4EBFF"
                          className="flex-1 px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-sm"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Text Colors Accordion */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <button
                type="button"
                onClick={() => toggleAccordion("text")}
                className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <span className="text-sm font-semibold text-gray-700">Text Colors</span>
                <ChevronDown
                  className={`w-5 h-5 text-gray-600 transition-transform ${
                    openAccordions.text ? "rotate-180" : ""
                  }`}
                />
              </button>
              {openAccordions.text && (
                <div className="p-4 bg-white">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Primary Text Color
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={formData.primary_text_color}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              primary_text_color: e.target.value,
                            })
                          }
                          className="w-12 h-11 rounded-lg border border-gray-300 cursor-pointer"
                        />
                        <input
                          type="text"
                          value={formData.primary_text_color}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              primary_text_color: e.target.value,
                            })
                          }
                          placeholder="#0F172A"
                          className="flex-1 px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-sm"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Secondary Text Color
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={formData.secondary_text_color}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              secondary_text_color: e.target.value,
                            })
                          }
                          className="w-12 h-11 rounded-lg border border-gray-300 cursor-pointer"
                        />
                        <input
                          type="text"
                          value={formData.secondary_text_color}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              secondary_text_color: e.target.value,
                            })
                          }
                          placeholder="#475467"
                          className="flex-1 px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-sm"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Table Colors Accordion */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <button
                type="button"
                onClick={() => toggleAccordion("table")}
                className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <span className="text-sm font-semibold text-gray-700">Table Colors</span>
                <ChevronDown
                  className={`w-5 h-5 text-gray-600 transition-transform ${
                    openAccordions.table ? "rotate-180" : ""
                  }`}
                />
              </button>
              {openAccordions.table && (
                <div className="p-4 bg-white">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Primary Table Color
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={formData.primary_table_color}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              primary_table_color: e.target.value,
                            })
                          }
                          className="w-12 h-11 rounded-lg border border-gray-300 cursor-pointer"
                        />
                        <input
                          type="text"
                          value={formData.primary_table_color}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              primary_table_color: e.target.value,
                            })
                          }
                          placeholder="#FFFFFF"
                          className="flex-1 px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-sm"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Secondary Table Color
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={formData.secondary_table_color}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              secondary_table_color: e.target.value,
                            })
                          }
                          className="w-12 h-11 rounded-lg border border-gray-300 cursor-pointer"
                        />
                        <input
                          type="text"
                          value={formData.secondary_table_color}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              secondary_table_color: e.target.value,
                            })
                          }
                          placeholder="#F8FAFC"
                          className="flex-1 px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-sm"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Card Colors Accordion */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <button
                type="button"
                onClick={() => toggleAccordion("card")}
                className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <span className="text-sm font-semibold text-gray-700">Card Colors</span>
                <ChevronDown
                  className={`w-5 h-5 text-gray-600 transition-transform ${
                    openAccordions.card ? "rotate-180" : ""
                  }`}
                />
              </button>
              {openAccordions.card && (
                <div className="p-4 bg-white">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Primary Card Color
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={formData.primary_card_color}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              primary_card_color: e.target.value,
                            })
                          }
                          className="w-12 h-11 rounded-lg border border-gray-300 cursor-pointer"
                        />
                        <input
                          type="text"
                          value={formData.primary_card_color}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              primary_card_color: e.target.value,
                            })
                          }
                          placeholder="#FFFFFF"
                          className="flex-1 px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-sm"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Secondary Card Color
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={formData.secondary_card_color}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              secondary_card_color: e.target.value,
                            })
                          }
                          className="w-12 h-11 rounded-lg border border-gray-300 cursor-pointer"
                        />
                        <input
                          type="text"
                          value={formData.secondary_card_color}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              secondary_card_color: e.target.value,
                            })
                          }
                          placeholder="#F9FAFB"
                          className="flex-1 px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-sm"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar Colors Accordion */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <button
                type="button"
                onClick={() => toggleAccordion("sidebar")}
                className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <span className="text-sm font-semibold text-gray-700">Sidebar Colors</span>
                <ChevronDown
                  className={`w-5 h-5 text-gray-600 transition-transform ${
                    openAccordions.sidebar ? "rotate-180" : ""
                  }`}
                />
              </button>
              {openAccordions.sidebar && (
                <div className="p-4 bg-white space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Sidebar Foreground
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={formData.sidebar_foreground}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              sidebar_foreground: e.target.value,
                            })
                          }
                          className="w-12 h-11 rounded-lg border border-gray-300 cursor-pointer"
                        />
                        <input
                          type="text"
                          value={formData.sidebar_foreground}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              sidebar_foreground: e.target.value,
                            })
                          }
                          placeholder="#CBD2EE"
                          className="flex-1 px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-sm"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Sidebar Primary
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={formData.sidebar_primary}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              sidebar_primary: e.target.value,
                            })
                          }
                          className="w-12 h-11 rounded-lg border border-gray-300 cursor-pointer"
                        />
                        <input
                          type="text"
                          value={formData.sidebar_primary}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              sidebar_primary: e.target.value,
                            })
                          }
                          placeholder="#0B1120"
                          className="flex-1 px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-sm"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Sidebar Primary Foreground
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={formData.sidebar_primary_foreground}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              sidebar_primary_foreground: e.target.value,
                            })
                          }
                          className="w-12 h-11 rounded-lg border border-gray-300 cursor-pointer"
                        />
                        <input
                          type="text"
                          value={formData.sidebar_primary_foreground}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              sidebar_primary_foreground: e.target.value,
                            })
                          }
                          placeholder="#FFFFFF"
                          className="flex-1 px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-sm"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Sidebar Header Primary
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={formData.sidebar_header_primary}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              sidebar_header_primary: e.target.value,
                            })
                          }
                          className="w-12 h-11 rounded-lg border border-gray-300 cursor-pointer"
                        />
                        <input
                          type="text"
                          value={formData.sidebar_header_primary}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              sidebar_header_primary: e.target.value,
                            })
                          }
                          placeholder="#1E293B"
                          className="flex-1 px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-sm"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Sidebar Header Foreground
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={formData.sidebar_header_foreground}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              sidebar_header_foreground: e.target.value,
                            })
                          }
                          className="w-12 h-11 rounded-lg border border-gray-300 cursor-pointer"
                        />
                        <input
                          type="text"
                          value={formData.sidebar_header_foreground}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              sidebar_header_foreground: e.target.value,
                            })
                          }
                          placeholder="#FFFFFF"
                          className="flex-1 px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-sm"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Header Colors Accordion */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <button
                type="button"
                onClick={() => toggleAccordion("header")}
                className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <span className="text-sm font-semibold text-gray-700">Header Colors</span>
                <ChevronDown
                  className={`w-5 h-5 text-gray-600 transition-transform ${
                    openAccordions.header ? "rotate-180" : ""
                  }`}
                />
              </button>
              {openAccordions.header && (
                <div className="p-4 bg-white">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Header Primary
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={formData.header_primary}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              header_primary: e.target.value,
                            })
                          }
                          className="w-12 h-11 rounded-lg border border-gray-300 cursor-pointer"
                        />
                        <input
                          type="text"
                          value={formData.header_primary}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              header_primary: e.target.value,
                            })
                          }
                          placeholder="#FFFFFF"
                          className="flex-1 px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-sm"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Header Foreground
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={formData.header_foreground}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              header_foreground: e.target.value,
                            })
                          }
                          className="w-12 h-11 rounded-lg border border-gray-300 cursor-pointer"
                        />
                        <input
                          type="text"
                          value={formData.header_foreground}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              header_foreground: e.target.value,
                            })
                          }
                          placeholder="#0F172A"
                          className="flex-1 px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-sm"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Is Default */}
          <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg border border-purple-200">
            <input
              type="checkbox"
              id="is_default"
              checked={formData.is_default}
              onChange={(e) =>
                setFormData({ ...formData, is_default: e.target.checked })
              }
              className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
            />
            <label htmlFor="is_default" className="text-sm font-medium text-gray-700 cursor-pointer">
              Set as default theme
            </label>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2.5 text-white rounded-lg transition-colors disabled:opacity-50 font-medium hover:opacity-90"
              style={{ backgroundColor: buttonPrimaryColor }}
            >
              {loading ? "Saving..." : theme ? "Update Theme" : "Create Theme"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
