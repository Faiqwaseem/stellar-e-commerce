import { useRef } from "react";
import { Image as ImageIcon, Upload, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface CategoryImageUploaderProps {
  image: string;
  onImageChange: (image: string) => void;
  onFileChange: (file: File | null) => void;
}

const MAX_SIZE_MB = 5;

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

export function CategoryImageUploader({
  image,
  onImageChange,
  onFileChange,
}: CategoryImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File | undefined) => {
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error("Only JPG, PNG, and WEBP images are allowed");
      return;
    }

    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      toast.error(`Image must be smaller than ${MAX_SIZE_MB}MB`);
      return;
    }

    const previewUrl = URL.createObjectURL(file);

    onFileChange(file);
    onImageChange(previewUrl);

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const removeImage = () => {
    if (image.startsWith("blob:")) {
      URL.revokeObjectURL(image);
    }

    onFileChange(null);
    onImageChange("");
  };

  return (
    <div className="space-y-3">
      <input
        ref={inputRef}
        type="file"
        accept={ALLOWED_TYPES.join(",")}
        className="hidden"
        onChange={(event) => handleFile(event.target.files?.[0])}
      />

      {!image ? (
        <Button
          type="button"
          variant="outline"
          className="w-full h-32 border-dashed flex flex-col gap-2"
          onClick={() => inputRef.current?.click()}
        >
          <Upload className="h-5 w-5" />

          <span className="text-xs">
            Upload category image
          </span>

          <span className="text-[11px] text-muted-foreground">
            JPG, PNG, WEBP · Max {MAX_SIZE_MB}MB
          </span>
        </Button>
      ) : (
        <div className="relative w-32 h-32">
          <img
            src={image}
            alt="Category preview"
            className="w-full h-full object-cover rounded-lg border"
            onError={(event) => {
              event.currentTarget.src = "/placeholder.svg";
            }}
          />

          <button
            type="button"
            onClick={removeImage}
            className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1"
            aria-label="Remove category image"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      )}

      {!image && (
        <div className="text-xs text-muted-foreground flex items-center gap-2">
          <ImageIcon className="h-3.5 w-3.5" />
          First upload an image for this category
        </div>
      )}
    </div>
  );
}