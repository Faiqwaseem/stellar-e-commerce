import { useRef, useState } from "react";
import {
  Upload,
  X,
  Loader2,
  Image as ImageIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ProductImageUploaderProps {
  images: string[];
  files: File[];
  onImagesChange: (images: string[]) => void;
  onFilesChange: (files: File[]) => void;
  maxImages?: number;
}

const MAX_SIZE_MB = 5;

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

export function ProductImageUploader({
  images,
  files,
  onImagesChange,
  onFilesChange,
  maxImages = 8,
}: ProductImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [processing, setProcessing] = useState(false);

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) {
      return;
    }

    const remaining = maxImages - images.length - files.length;

    if (remaining <= 0) {
      toast.error(`Maximum ${maxImages} images allowed`);
      return;
    }

    const selectedFiles = Array.from(fileList).slice(0, remaining);

    setProcessing(true);

    const validFiles: File[] = [];
    const previewUrls: string[] = [];

    for (const file of selectedFiles) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        toast.error(`${file.name}: unsupported format`);
        continue;
      }

      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        toast.error(`${file.name}: exceeds ${MAX_SIZE_MB}MB`);
        continue;
      }

      validFiles.push(file);
      previewUrls.push(URL.createObjectURL(file));
    }

    if (validFiles.length > 0) {
      onFilesChange([...files, ...validFiles]);
      onImagesChange([...images, ...previewUrls]);

      toast.success(
        `${validFiles.length} image${
          validFiles.length > 1 ? "s" : ""
        } selected`,
      );
    }

    setProcessing(false);

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const removeImage = (index: number) => {
    const existingImageCount = images.length - files.length;

    if (index < existingImageCount) {
      onImagesChange(
        images.filter((_, imageIndex) => imageIndex !== index),
      );
      return;
    }

    const fileIndex = index - existingImageCount;

    const previewUrl = images[index];

    if (previewUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }

    onImagesChange(
      images.filter((_, imageIndex) => imageIndex !== index),
    );

    onFilesChange(
      files.filter((_, currentIndex) => currentIndex !== fileIndex),
    );
  };

  const totalImages = images.length;

  return (
    <div className="space-y-3">
      <input
        ref={inputRef}
        type="file"
        accept={ALLOWED_TYPES.join(",")}
        multiple
        className="hidden"
        onChange={(event) => handleFiles(event.target.files)}
      />

      <Button
        type="button"
        variant="outline"
        className="w-full h-24 border-dashed flex flex-col gap-2"
        onClick={() => inputRef.current?.click()}
        disabled={processing || totalImages >= maxImages}
      >
        {processing ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-xs">
              Processing...
            </span>
          </>
        ) : (
          <>
            <Upload className="h-5 w-5" />

            <span className="text-xs">
              {totalImages >= maxImages
                ? `Maximum ${maxImages} images reached`
                : `Click to upload (${totalImages}/${maxImages}) · max ${MAX_SIZE_MB}MB each`}
            </span>
          </>
        )}
      </Button>

      {totalImages > 0 ? (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {images.map((url, index) => (
            <div
              key={`${url}-${index}`}
              className="relative group aspect-square rounded-lg overflow-hidden border bg-muted"
            >
              <img
                src={url}
                alt={`Product ${index + 1}`}
                className="w-full h-full object-cover"
                onError={(event) => {
                  event.currentTarget.src =
                    "/placeholder.svg";
                }}
              />

              {index === 0 && (
                <div className="absolute top-1 left-1 bg-primary text-primary-foreground text-[10px] font-medium px-1.5 py-0.5 rounded">
                  Cover
                </div>
              )}

              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label={`Remove image ${index + 1}`}
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-6 text-muted-foreground text-xs flex flex-col items-center gap-2">
          <ImageIcon className="h-8 w-8 opacity-40" />

          <span>
            No images yet — first uploaded image becomes the
            cover
          </span>
        </div>
      )}
    </div>
  );
}