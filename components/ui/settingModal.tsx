"use client";

import { DialogFooter, DialogHeader } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PlusCircle, Lock, MinusCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export function SettingsModal({
  open,
  onClose,
  setSettingsConfigured,
}: {
  open: boolean;
  onClose: () => void;
  setSettingsConfigured: any;
}) {
  const [selectedDevices, setSelectedDevices] = useState(["All"]);
  const [selectedTraffic, setSelectedTraffic] = useState(["All Traffic"]);
  const [selectedVisitorType, setSelectedVisitorType] = useState(["All"]);
  const [selectedOS, setSelectedOS] = useState(["All"]);
  const [selectedBrowser, setSelectedBrowser] = useState(["All"]);
  const [locationType, setLocationType] = useState("all");

  const [includePages, setIncludePages] = useState([
    { matchType: "Contains", url: "https://demo.tigsaw.com/" },
  ]);
  const [excludePages, setExcludePages] = useState<
    { matchType: string; url: string }[]
  >([]);
  const [showExclude, setShowExclude] = useState(false);

  const [errors, setErrors] = useState<{
    include?: number[];
    exclude?: number[];
  }>({});

  const editorUrlRef = useRef<HTMLInputElement | null>(null);
  const locationRef = useRef<HTMLSelectElement | null>(null);

  useEffect(() => {
    if (editorUrlRef.current) {
      const value = editorUrlRef.current.value;
      setIncludePages((prev) => {
        const updated = [...prev];
        updated[0].url = value;
        return updated;
      });
    }
  }, [open]);

  const handleAddField = (type: "include" | "exclude") => {
    const value = editorUrlRef.current?.value || "";
    const newItem = { matchType: "Contains", url: value };
    if (type === "include") {
      setIncludePages([...includePages, newItem]);
    } else {
      setExcludePages([...excludePages, newItem]);
    }
  };

  const handleRemoveField = (type: "include" | "exclude", index: number) => {
    if (type === "include") {
      if (includePages.length > 1) {
        setIncludePages(includePages.filter((_, i) => i !== index));
      }
    } else {
      setExcludePages(excludePages.filter((_, i) => i !== index));
    }
  };

  const handleChange = (
    type: "include" | "exclude",
    index: number,
    key: "matchType" | "url",
    value: string
  ) => {
    const list = type === "include" ? [...includePages] : [...excludePages];
    list[index][key] = value;
    type === "include" ? setIncludePages(list) : setExcludePages(list);
  };

  const handleSelection = (
    current: string[],
    value: string,
    allLabel: string,
    setFn: Function
  ) => {
    if (value === allLabel) {
      setFn(current.includes(allLabel) ? [] : [allLabel]);
    } else {
      const updated = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current.filter((v) => v !== allLabel), value];
      setFn(updated.length > 0 ? updated : [allLabel]);
    }
  };

  const validate = () => {
    const includeErrors = includePages.map((field) =>
      field.url.trim() === "" ? 1 : 0
    );
    const excludeErrors = excludePages.map((field) =>
      field.url.trim() === "" ? 1 : 0
    );

    const hasIncludeErrors = includeErrors.some((err) => err === 1);
    const hasExcludeErrors = excludeErrors.some((err) => err === 1);

    if (hasIncludeErrors || hasExcludeErrors) {
      setErrors({
        include: includeErrors.flatMap((v, i) => (v ? [i] : [])),
        exclude: excludeErrors.flatMap((v, i) => (v ? [i] : [])),
      });
      return false;
    } else {
      setErrors({});
      return true;
    }
  };

  const handleDoneClick = () => {
    if (!validate()) return;

    const data = {
      editorUrl: editorUrlRef.current?.value || "",
      includePages,
      excludePages,
      selectedDevices,
      selectedTraffic,
      selectedVisitorType,
      selectedBrowser,
      selectedOS,
      locationType,
      customLocation:
        locationType === "custom" ? locationRef.current?.value : null,
    };

    console.log("✅ Final config:", data);

    onClose();
    setSettingsConfigured(true);
  };

  if (!open) return null;

  return (
    <div className="absolute inset-0 z-50 bg-white p-8 overflow-y-auto">
      <div className="max-w-7xl mx-auto">
        <DialogHeader>
          <h2 className="text-xl font-semibold text-gray-900">
            Editor Settings
          </h2>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-12 mt-8">
          {/* Left Side */}
          <div className="space-y-8">
            {/* Editor URL */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Editor URL
              </label>
              <input
                ref={editorUrlRef}
                defaultValue="https://demo.tigsaw.com/"
                onChange={(e) => {
                  const val = e.target.value;
                  setIncludePages((prev) => {
                    const updated = [...prev];
                    updated[0].url = val;
                    return updated;
                  });
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-sm focus:outline-none"
              />
            </div>

            {/* Include Section */}
            {renderPageFields(
              "include",
              includePages,
              errors.include,
              handleAddField,
              handleRemoveField,
              handleChange
            )}

            {/* Buttons */}
            <div className="flex items-center gap-8 mt-4">
              <button
                type="button"
                onClick={() => handleAddField("include")}
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Include pages</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowExclude(true);
                  handleAddField("exclude"); // Always add one
                }}
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Exclude pages</span>
              </button>
            </div>

            {/* Exclude Section */}
            {showExclude &&
              renderPageFields(
                "exclude",
                excludePages,
                errors.exclude,
                handleAddField,
                handleRemoveField,
                handleChange
              )}
          </div>

          {/* Right Side */}
          <div className="space-y-8">
            <DeviceCheckboxGroup
              label="Select Devices"
              values={["All", "Mobile", "Tablet", "Desktop"]}
              selected={selectedDevices}
              onChange={(value) =>
                handleSelection(
                  selectedDevices,
                  value,
                  "All",
                  setSelectedDevices
                )
              }
            />
            <DeviceCheckboxGroup
              label="Traffic Source"
              values={[
                "All Traffic",
                "Direct Traffic",
                "Paid Traffic",
                "Search Traffic",
                "Meta Ads",
                "Referral Traffic",
                "Google Ads",
              ]}
              selected={selectedTraffic}
              onChange={(value) =>
                handleSelection(
                  selectedTraffic,
                  value,
                  "All Traffic",
                  setSelectedTraffic
                )
              }
            />
            <DeviceCheckboxGroup
              label="Visitor Type"
              values={["All", "New", "Returning"]}
              selected={selectedVisitorType}
              onChange={(value) =>
                handleSelection(
                  selectedVisitorType,
                  value,
                  "All",
                  setSelectedVisitorType
                )
              }
              labelMap={{
                New: "New Visitors",
                Returning: "Returning Visitors",
              }}
            />
            <DeviceCheckboxGroup
              label="Operating System"
              values={[
                "All",
                "Windows",
                "macOS",
                "Linux",
                "iOS",
                "Android",
                "Chrome OS",
              ]}
              selected={selectedOS}
              onChange={(value) =>
                handleSelection(selectedOS, value, "All", setSelectedOS)
              }
            />
            <DeviceCheckboxGroup
              label="Browser"
              values={[
                "All",
                "Chrome",
                "Firefox",
                "Safari",
                "Edge",
                "Opera",
                "Internet Explorer",
              ]}
              selected={selectedBrowser}
              onChange={(value) =>
                handleSelection(
                  selectedBrowser,
                  value,
                  "All",
                  setSelectedBrowser
                )
              }
            />
            <div>
              <label className="text-sm font-medium text-gray-900 mb-2 block">
                Location
              </label>
              <div className="flex items-center gap-6 mb-3">
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="radio"
                    name="location"
                    value="all"
                    checked={locationType === "all"}
                    onChange={(e) => setLocationType(e.target.value)}
                    className="w-4 h-4 accent-black border-gray-300"
                  />
                  All Locations
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="radio"
                    name="location"
                    value="custom"
                    checked={locationType === "custom"}
                    onChange={(e) => setLocationType(e.target.value)}
                    className="w-4 h-4 accent-black border-gray-300"
                  />
                  Custom Locations
                </label>
              </div>
              {locationType === "custom" && (
                <div className="mt-2">
                  <label className="block text-xs text-gray-500 mb-1">
                    Select Country
                  </label>
                  <select
                    ref={locationRef}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-sm focus:outline-none"
                  >
                    <option>United States</option>
                    <option>Canada</option>
                    <option>United Kingdom</option>
                    <option>Australia</option>
                    <option>Germany</option>
                    <option>France</option>
                  </select>
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="mt-8 flex justify-end">
          <Button
            onClick={handleDoneClick}
            className="bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 text-white px-8 py-2 rounded-md font-medium"
          >
            Done
          </Button>
        </DialogFooter>
      </div>
    </div>
  );
}

// Render Fields (for include & exclude)
function renderPageFields(
  type: "include" | "exclude",
  fields: { matchType: string; url: string }[],
  errorIndexes: number[] | undefined,
  handleAdd: Function,
  handleRemove: Function,
  handleChange: Function
) {
  const isInclude = type === "include";

  return (
    <div className="mt-6">
      {/* 🚫 Show label only for include */}
      {isInclude && (
        <label className="block text-sm font-medium text-gray-900 mb-4">
          Include pages where
        </label>
      )}

      {fields.map((field, index) => (
        <div key={index} className="mb-4">
          <div className="flex gap-2 items-center">
            <select
              value={field.matchType}
              onChange={(e) =>
                handleChange(type, index, "matchType", e.target.value)
              }
              className="px-3 py-2 border border-gray-300 rounded-md bg-white text-sm focus:outline-none"
            >
              <option>Exactly Matches</option>
              <option>Contains</option>
              <option>Start with</option>
            </select>

            <div className="relative w-full">
              <input
                type="text"
                value={field.url}
                onChange={(e) =>
                  handleChange(type, index, "url", e.target.value)
                }
                className={`w-full pr-8 px-3 py-2 border ${
                  errorIndexes?.includes(index)
                    ? "border-red-500"
                    : "border-gray-300"
                } rounded-md bg-white text-sm focus:outline-none`}
              />
              {/* Show remove button */}
              {(isInclude ? fields.length > 1 : true) && (
                <MinusCircle
                  onClick={() => handleRemove(type, index)}
                  className="absolute top-1/2 right-2 -translate-y-1/2 w-4 h-4 text-gray-500 hover:text-red-500 cursor-pointer"
                />
              )}
            </div>
          </div>

          {errorIndexes?.includes(index) && (
            <p className="text-xs text-red-500 mt-1 ml-[160px]">
              URL is required
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

// Reuse for Devices, Browser, OS, etc.
function DeviceCheckboxGroup({
  label,
  values,
  selected,
  onChange,
  labelMap,
}: {
  label: string;
  values: string[];
  selected: string[];
  onChange: (value: string) => void;
  labelMap?: Record<string, string>;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-900 mb-3">
        {label}
      </label>
      <div className="grid grid-cols-3 gap-x-6 gap-y-2">
        {values.map((value) => (
          <label
            key={value}
            className={`flex items-center gap-2 text-sm ${
              selected.includes(values[0]) && value !== values[0]
                ? "text-gray-400 cursor-not-allowed"
                : "text-gray-700"
            }`}
          >
            <input
              type="checkbox"
              checked={selected.includes(value)}
              disabled={selected.includes(values[0]) && value !== values[0]}
              onChange={() => onChange(value)}
              className="w-4 h-4 !rounded-lg accent-black border-gray-300 focus:ring-black disabled:opacity-50 disabled:bg-gray-200"
            />
            {labelMap?.[value] || value}
          </label>
        ))}
      </div>
    </div>
  );
}
