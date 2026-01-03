"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Image as ImageIcon, X, Loader2 } from "lucide-react";
import { uploadImage } from "@/hooks/api/upload/UploadImage";

interface ImageUploadProps {
  onImageSelect: (imageUrl: string) => void;
  onCancel?: () => void;
  buttonLabel?: string;
}

export function ImageUpload({
  onImageSelect,
  onCancel,
  buttonLabel = "Upload & Send",
}: ImageUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!validTypes.includes(file.type)) {
      setError("Only images (JPEG, PNG, GIF, WebP) are allowed");
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setError("File too large. Maximum size is 5MB");
      return;
    }

    setError("");
    setSelectedFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadProgress(0);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      // Simulate progress (since we can't track actual upload progress easily)
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const data = await uploadImage(formData);

      clearInterval(progressInterval);
      setUploadProgress(100);

      onImageSelect(data.url);

      // Reset state
      setSelectedFile(null);
      setPreviewUrl(null);
      setUploadProgress(0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
      setUploadProgress(0);
    } finally {
      setIsUploading(false);
    }
  };

  const handleCancel = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setError("");
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onCancel?.();
  };

  return (
    <div className="space-y-4">
      {/* File Input */}
      {!previewUrl && (
        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            id="image-upload"
          />
          <label htmlFor="image-upload">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="cursor-pointer"
              asChild
            >
              <span>
                <ImageIcon className="w-4 h-4 mr-2" />
                Pilih Gambar
              </span>
            </Button>
          </label>
          {onCancel && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleCancel}
            >
              Batal
            </Button>
          )}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-3 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
          {error}
        </div>
      )}

      {/* Preview */}
      {previewUrl && (
        <div className="space-y-3">
          <div className="relative inline-block w-full max-w-sm">
            <Image
              src={previewUrl}
              alt="Preview"
              width={300}
              height={300}
              className="rounded-lg object-contain max-h-64 border border-gray-200 dark:border-gray-700"
            />
            {!isUploading && (
              <button
                onClick={handleCancel}
                className="absolute top-2 right-2 p-1 bg-red-600 hover:bg-red-700 text-white rounded-full transition-colors"
                title="Remove image"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Upload Progress */}
          {isUploading && (
            <div className="space-y-2">
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Uploading... {uploadProgress}%
              </p>
            </div>
          )}

          {/* Upload Button */}
          {!isUploading && (
            <div className="flex gap-2">
              <Button
                type="button"
                onClick={handleUpload}
                disabled={isUploading}
                size="sm"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <ImageIcon className="w-4 h-4 mr-2" />
                    {buttonLabel}
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCancel}
                disabled={isUploading}
              >
                Batal
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
