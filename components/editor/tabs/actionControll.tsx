// components/controls/ActionControls.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";

interface ActionControlsProps {
  selectedElement: any;
  updateAttribute: (key: string, value: any) => void;
}

export function ActionControls({
  selectedElement,
  updateAttribute,
}: ActionControlsProps) {
  const action = selectedElement?.customAction || {};

  const updateCustomAction = (key: string, value: any) => {
    updateAttribute("customAction", { ...action, [key]: value });
  };

  const toggleDevice = (device: string) => {
    const devices = new Set(action.devices || []);
    if (devices.has(device)) {
      devices.delete(device);
    } else {
      devices.add(device);
    }
    updateCustomAction("devices", Array.from(devices));
  };

  const isAllSelected = action.devices?.includes("all");

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">URL Action Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* URL input */}
          <div className="space-y-1">
            <Label className="text-xs text-gray-600">URL</Label>
            <Input
              className="text-xs"
              value={action.url || ""}
              onChange={(e) => updateCustomAction("url", e.target.value)}
              placeholder="https://your-url.com"
            />
          </div>

          {/* Matching Type */}
          <div className="space-y-1">
            <Label className="text-xs text-gray-600">URL Matching Type</Label>
            <Select
              value={action.matchingType || "exact"}
              onValueChange={(val) => updateCustomAction("matchingType", val)}
            >
              <SelectTrigger className="text-xs">
                <SelectValue placeholder="Select matching type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="exact">Exactly matches</SelectItem>
                <SelectItem value="contains">Contains</SelectItem>
                <SelectItem value="startsWith">Starts with</SelectItem>
                <SelectItem value="endsWith">Ends with</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Match Text */}
          <div className="space-y-1">
            <Label className="text-xs text-gray-600">Enter matching text</Label>
            <Input
              className="text-xs"
              value={action.matchText || ""}
              onChange={(e) => updateCustomAction("matchText", e.target.value)}
              placeholder="Enter the match text"
            />
          </div>

          {/* Devices */}
          <div className="space-y-1">
            <Label className="text-xs text-gray-600">Select Devices</Label>
            <div className="flex flex-wrap gap-4 pt-1">
              {["all", "mobile", "tablet", "desktop"].map((device) => (
                <div key={device} className="flex items-center space-x-2">
                  <Checkbox
                    id={device}
                    checked={action.devices?.includes(device)}
                    onCheckedChange={() => toggleDevice(device)}
                  />
                  <Label htmlFor={device} className="text-xs capitalize">
                    {device}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Save Button */}
          <div className="pt-2">
            <Button
              className="text-sm font-medium px-6 bg-gradient-to-r from-orange-400 to-red-500 text-white hover:brightness-110"
              onClick={() => {
                console.log("Save clicked", action);
                // Optional: trigger a callback or emit to parent
              }}
            >
              Save
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
