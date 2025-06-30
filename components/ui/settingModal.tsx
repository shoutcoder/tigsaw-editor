"use client";

import { Dialog, DialogFooter, DialogHeader } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PlusCircle, Lock } from "lucide-react";

export function SettingsModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  if (!open) return null;

  return (
    <div className="absolute inset-0 z-50 bg-white  p-8 overflow-y-auto">
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
                type="text"
                defaultValue="https://demo.tigsaw.com/"
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-sm focus:outline-none"
              />
            </div>

            {/* Include pages where */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Include pages where
              </label>
              <div className="flex gap-2 mb-4">
                <select className="px-3 py-2 border border-gray-300 rounded-md bg-white text-sm focus:outline-none">
                  <option>URL contains</option>
                </select>
                <input
                  type="text"
                  defaultValue="/1962-racing-chronograph"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-white text-sm focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-8">
                <div className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer hover:text-gray-800">
                  <PlusCircle className="w-4 h-4" />
                  <span>Include pages</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-400 cursor-not-allowed">
                  <PlusCircle className="w-4 h-4" />
                  <span>Exclude pages</span>
                  <Lock className="w-3 h-3 text-orange-500" />
                </div>
              </div>
            </div>
          </div>

          {/* Right Side */}
          <div className="space-y-8">
            {/* Select Devices */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-3">
                Select Devices
              </label>
              <div className="grid grid-cols-4 gap-x-6 gap-y-2">
                {[
                  { label: "All", checked: true },
                  { label: "Mobile", checked: false },
                  { label: "Tablet", checked: false },
                  { label: "Desktop", checked: false },
                ].map((item) => (
                  <label
                    key={item.label}
                    className="flex items-center gap-2 text-sm text-gray-700"
                  >
                    <input
                      type="checkbox"
                      defaultChecked={item.checked}
                      className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
                    />
                    {item.label}
                  </label>
                ))}
              </div>
            </div>

            {/* Traffic Source */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <label className="text-sm font-medium text-gray-900">
                  Traffic Source
                </label>
                <Lock className="w-3 h-3 text-orange-500" />
              </div>
              <div className="grid grid-cols-3 gap-x-6 gap-y-2">
                {[
                  { label: "All Traffic", checked: true },
                  { label: "Direct Traffic", checked: false },
                  { label: "Paid Traffic", checked: false },
                  { label: "Search Traffic", checked: false },
                  { label: "Meta Ads", checked: false },
                  { label: "Referral Traffic", checked: false },
                  { label: "Google Ads", checked: false },
                ].map((item) => (
                  <label
                    key={item.label}
                    className="flex items-center gap-2 text-sm text-gray-400"
                  >
                    <input
                      type="checkbox"
                      defaultChecked={item.checked}
                      disabled
                      className="w-4 h-4 text-gray-300 border-gray-300 rounded disabled:opacity-50"
                    />
                    {item.label}
                  </label>
                ))}
              </div>
            </div>

            {/* Visitor Type */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <label className="text-sm font-medium text-gray-900">
                  Visitor Type
                </label>
                <Lock className="w-3 h-3 text-orange-500" />
              </div>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm text-gray-400">
                  <input
                    type="checkbox"
                    defaultChecked
                    disabled
                    className="w-4 h-4 text-gray-300 border-gray-300 rounded disabled:opacity-50"
                  />
                  New Visitors
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-400">
                  <input
                    type="checkbox"
                    disabled
                    className="w-4 h-4 text-gray-300 border-gray-300 rounded disabled:opacity-50"
                  />
                  Returning Visitors
                </label>
              </div>
            </div>

            {/* Location */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <label className="text-sm font-medium text-gray-900">
                  Location
                </label>
                <Lock className="w-3 h-3 text-orange-500" />
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 text-sm text-gray-400">
                    <input
                      type="radio"
                      name="location"
                      disabled
                      className="w-4 h-4 text-gray-300 border-gray-300 disabled:opacity-50"
                    />
                    All Locations
                  </label>
                  <label className="flex items-center gap-2 text-sm text-gray-400">
                    <input
                      type="radio"
                      name="location"
                      defaultChecked
                      disabled
                      className="w-4 h-4 text-gray-300 border-gray-300 disabled:opacity-50"
                    />
                    Custom Locations
                  </label>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      Country
                    </label>
                    <select
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm text-gray-400 disabled:opacity-50"
                    >
                      <option>United States</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      State
                    </label>
                    <select
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm text-gray-400 disabled:opacity-50"
                    >
                      <option>All States</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="mt-8 flex justify-end">
          <Button
            onClick={onClose}
            className="bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 text-white px-8 py-2 rounded-md font-medium"
          >
            Done
          </Button>
        </DialogFooter>
      </div>
    </div>
  );
} // "use client";

// import {
//   Dialog,
//   DialogContent,
//   DialogFooter,
//   DialogHeader,
// } from "@/components/ui/dialog";
// import { Button } from "@/components/ui/button";
// import { PlusCircle, Lock } from "lucide-react";

// export function SettingsModal({
//   open,
//   onClose,
// }: {
//   open: boolean;
//   onClose: () => void;
// }) {
//   return (
//     <Dialog open={open} onOpenChange={onClose}>
//       <DialogContent className="max-w-7xl p-8 bg-white">
//         <DialogHeader>
//           <h2 className="text-xl font-semibold text-gray-900">
//             Editor Settings
//           </h2>
//         </DialogHeader>

//         <div className="grid  md:grid-cols-2 gap-12 mt-8">
//           {/* Left Side */}
//           <div className="space-y-8">
//             {/* Editor URL */}
//             <div>
//               <label className="block text-sm font-medium text-gray-900 mb-2">
//                 Editor URL
//               </label>
//               <input
//                 type="text"
//                 defaultValue="https://demo.tigsaw.com/"
//                 readOnly
//                 className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-sm focus:outline-none"
//               />
//             </div>

//             {/* Include pages where */}
//             <div>
//               <label className="block text-sm font-medium text-gray-900 mb-2">
//                 Include pages where
//               </label>
//               <div className="flex gap-2 mb-4">
//                 <select className="px-3 py-2 border border-gray-300 rounded-md bg-white text-sm focus:outline-none">
//                   <option>URL contains</option>
//                 </select>
//                 <input
//                   type="text"
//                   defaultValue="/1962-racing-chronograph"
//                   className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-white text-sm focus:outline-none"
//                 />
//               </div>

//               <div className="flex items-center gap-8">
//                 <div className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer hover:text-gray-800">
//                   <PlusCircle className="w-4 h-4" />
//                   <span>Include pages</span>
//                 </div>
//                 <div className="flex items-center gap-2 text-sm text-gray-400 cursor-not-allowed">
//                   <PlusCircle className="w-4 h-4" />
//                   <span>Exclude pages</span>
//                   <Lock className="w-3 h-3 text-orange-500" />
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Right Side */}
//           <div className="space-y-8">
//             {/* Select Devices */}
//             <div>
//               <label className="block text-sm font-medium text-gray-900 mb-3">
//                 Select Devices
//               </label>
//               <div className="grid grid-cols-4 gap-x-6 gap-y-2">
//                 {[
//                   { label: "All", checked: true },
//                   { label: "Mobile", checked: false },
//                   { label: "Tablet", checked: false },
//                   { label: "Desktop", checked: false },
//                 ].map((item) => (
//                   <label
//                     key={item.label}
//                     className="flex items-center gap-2 text-sm text-gray-700"
//                   >
//                     <input
//                       type="checkbox"
//                       defaultChecked={item.checked}
//                       className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
//                     />
//                     {item.label}
//                   </label>
//                 ))}
//               </div>
//             </div>

//             {/* Traffic Source */}
//             <div>
//               <div className="flex items-center gap-2 mb-3">
//                 <label className="text-sm font-medium text-gray-900">
//                   Traffic Source
//                 </label>
//                 <Lock className="w-3 h-3 text-orange-500" />
//               </div>
//               <div className="grid grid-cols-3 gap-x-6 gap-y-2">
//                 {[
//                   { label: "All Traffic", checked: true },
//                   { label: "Direct Traffic", checked: false },
//                   { label: "Paid Traffic", checked: false },
//                   { label: "Search Traffic", checked: false },
//                   { label: "Meta Ads", checked: false },
//                   { label: "Referral Traffic", checked: false },
//                   { label: "Google Ads", checked: false },
//                 ].map((item) => (
//                   <label
//                     key={item.label}
//                     className="flex items-center gap-2 text-sm text-gray-400"
//                   >
//                     <input
//                       type="checkbox"
//                       defaultChecked={item.checked}
//                       disabled
//                       className="w-4 h-4 text-gray-300 border-gray-300 rounded disabled:opacity-50"
//                     />
//                     {item.label}
//                   </label>
//                 ))}
//               </div>
//             </div>

//             {/* Visitor Type */}
//             <div>
//               <div className="flex items-center gap-2 mb-3">
//                 <label className="text-sm font-medium text-gray-900">
//                   Visitor Type
//                 </label>
//                 <Lock className="w-3 h-3 text-orange-500" />
//               </div>
//               <div className="space-y-2">
//                 <label className="flex items-center gap-2 text-sm text-gray-400">
//                   <input
//                     type="checkbox"
//                     defaultChecked
//                     disabled
//                     className="w-4 h-4 text-gray-300 border-gray-300 rounded disabled:opacity-50"
//                   />
//                   New Visitors
//                 </label>
//                 <label className="flex items-center gap-2 text-sm text-gray-400">
//                   <input
//                     type="checkbox"
//                     disabled
//                     className="w-4 h-4 text-gray-300 border-gray-300 rounded disabled:opacity-50"
//                   />
//                   Returning Visitors
//                 </label>
//               </div>
//             </div>

//             {/* Location */}
//             <div>
//               <div className="flex items-center gap-2 mb-3">
//                 <label className="text-sm font-medium text-gray-900">
//                   Location
//                 </label>
//                 <Lock className="w-3 h-3 text-orange-500" />
//               </div>
//               <div className="space-y-3">
//                 <div className="flex items-center gap-6">
//                   <label className="flex items-center gap-2 text-sm text-gray-400">
//                     <input
//                       type="radio"
//                       name="location"
//                       disabled
//                       className="w-4 h-4 text-gray-300 border-gray-300 disabled:opacity-50"
//                     />
//                     All Locations
//                   </label>
//                   <label className="flex items-center gap-2 text-sm text-gray-400">
//                     <input
//                       type="radio"
//                       name="location"
//                       defaultChecked
//                       disabled
//                       className="w-4 h-4 text-gray-300 border-gray-300 disabled:opacity-50"
//                     />
//                     Custom Locations
//                   </label>
//                 </div>
//                 <div className="grid grid-cols-2 gap-4">
//                   <div>
//                     <label className="block text-xs text-gray-500 mb-1">
//                       Country
//                     </label>
//                     <select
//                       disabled
//                       className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm text-gray-400 disabled:opacity-50"
//                     >
//                       <option>United States</option>
//                     </select>
//                   </div>
//                   <div>
//                     <label className="block text-xs text-gray-500 mb-1">
//                       State
//                     </label>
//                     <select
//                       disabled
//                       className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm text-gray-400 disabled:opacity-50"
//                     >
//                       <option>All States</option>
//                     </select>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>

//         <DialogFooter className="mt-8 flex justify-end">
//           <Button
//             onClick={onClose}
//             className="bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 text-white px-8 py-2 rounded-md font-medium"
//           >
//             Done
//           </Button>
//         </DialogFooter>
//       </DialogContent>
//     </Dialog>
//   );
// }
