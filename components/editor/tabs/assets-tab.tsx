"use client"

import type React from "react"

import { useRef } from "react"
import { useEditor, findElementById } from "@/contexts/editor-context"
import type { Asset } from "@/contexts/editor-context"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Upload, Trash2, ImageIcon, Video } from "lucide-react"
import { generateId } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"

export function AssetsTab() {
  const { state, dispatch } = useEditor()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const fileType = file.type.startsWith("image/") ? "image" : file.type.startsWith("video/") ? "video" : null

    if (!fileType) {
      // Optionally, show a toast notification for unsupported file types
      console.error("Unsupported file type:", file.type)
      return
    }

    const newAsset: Asset = {
      id: generateId(),
      name: file.name,
      url: URL.createObjectURL(file),
      type: fileType,
    }

    dispatch({ type: "ADD_ASSET", payload: { asset: newAsset } })
  }

  const handleAssetSelect = (asset: Asset) => {
    const selectedElement = findElementById(state.elements, state.selectedElement)
    if (!selectedElement) return

    // Logic for direct application to img/video tags
    if (
      (asset.type === "image" && selectedElement.tag === "img") ||
      (asset.type === "video" && selectedElement.tag === "video")
    ) {
      dispatch({
        type: "UPDATE_ELEMENT",
        payload: {
          id: selectedElement.id,
          updates: {
            attributes: {
              ...selectedElement.attributes,
              src: asset.url,
            },
          },
        },
      })
      dispatch({ type: "SET_ACTIVE_TAB", payload: { tab: "styles" } })
      return
    }

    // Logic for applying as a style (e.g., background image)
    if (asset.type === "image") {
      dispatch({ type: "SELECT_ASSET_FOR_STYLE", payload: { asset } })
      dispatch({ type: "SET_ACTIVE_TAB", payload: { tab: "styles" } })
    } else {
      // Optionally, show a toast that the asset type doesn't match the element
      // This warning is now more contextual.
      console.warn("Asset type cannot be applied as a style to this element.")
    }
  }

  const handleDeleteAsset = (e: React.MouseEvent, assetId: string) => {
    e.stopPropagation()
    // Note: This doesn't revoke the object URL, which might lead to memory leaks in a long-running app.
    // For a real app, you'd manage this more carefully.
    dispatch({ type: "DELETE_ASSET", payload: { id: assetId } })
  }

  const images = state.assets.filter((a) => a.type === "image")
  const videos = state.assets.filter((a) => a.type === "video")

  return (
    <div className="p-4 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-900">Assets</h3>
        <Button size="sm" onClick={handleUploadClick}>
          <Upload className="w-4 h-4 mr-2" />
          Upload
        </Button>
        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*,video/*" />
      </div>
      <ScrollArea className="flex-1 -mx-4">
        <div className="px-4">
          {state.assets.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-sm text-gray-500">No assets yet.</p>
              <p className="text-xs text-gray-400">Upload images and videos to get started.</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <h4 className="text-xs font-medium text-gray-500 mb-2 flex items-center">
                  <ImageIcon className="w-3 h-3 mr-2" /> Images ({images.length})
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {images.map((asset) => (
                    <Card
                      key={asset.id}
                      className="group relative cursor-pointer hover:ring-2 hover:ring-blue-500"
                      onClick={() => handleAssetSelect(asset)}
                    >
                      <CardContent className="p-0">
                        <img
                          src={asset.url || "/placeholder.svg"}
                          alt={asset.name}
                          className="w-full h-24 object-cover rounded-t-lg"
                        />
                        <p className="text-xs p-2 truncate" title={asset.name}>
                          {asset.name}
                        </p>
                        <Button
                          variant="destructive"
                          size="sm"
                          className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                          onClick={(e) => handleDeleteAsset(e, asset.id)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-xs font-medium text-gray-500 mb-2 flex items-center">
                  <Video className="w-3 h-3 mr-2" /> Videos ({videos.length})
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {videos.map((asset) => (
                    <Card
                      key={asset.id}
                      className="group relative cursor-pointer hover:ring-2 hover:ring-blue-500"
                      onClick={() => handleAssetSelect(asset)}
                    >
                      <CardContent className="p-0">
                        <video src={asset.url} className="w-full h-24 object-cover rounded-t-lg bg-black" />
                        <p className="text-xs p-2 truncate" title={asset.name}>
                          {asset.name}
                        </p>
                        <Button
                          variant="destructive"
                          size="sm"
                          className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                          onClick={(e) => handleDeleteAsset(e, asset.id)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
