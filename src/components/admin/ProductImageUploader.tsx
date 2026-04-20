import { useRef, useState } from 'react';
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface ProductImageUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
}

const MAX_SIZE_MB = 5;
const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export function ProductImageUploader({
  images,
  onChange,
  maxImages = 8,
}: ProductImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const remaining = maxImages - images.length;
    if (remaining <= 0) {
      toast.error(`Maximum ${maxImages} images allowed`);
      return;
    }

    const toUpload = Array.from(files).slice(0, remaining);
    setUploading(true);
    const uploaded: string[] = [];

    for (const file of toUpload) {
      if (!ALLOWED.includes(file.type)) {
        toast.error(`${file.name}: unsupported format`);
        continue;
      }
      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        toast.error(`${file.name}: exceeds ${MAX_SIZE_MB}MB`);
        continue;
      }

      const ext = file.name.split('.').pop() || 'jpg';
      const path = `${crypto.randomUUID()}.${ext}`;

      const { error } = await supabase.storage
        .from('product-images')
        .upload(path, file, { contentType: file.type, upsert: false });

      if (error) {
        toast.error(`Failed to upload ${file.name}`, { description: error.message });
        continue;
      }

      const { data: pub } = supabase.storage
        .from('product-images')
        .getPublicUrl(path);
      uploaded.push(pub.publicUrl);
    }

    if (uploaded.length > 0) {
      onChange([...images, ...uploaded]);
      toast.success(`Uploaded ${uploaded.length} image${uploaded.length > 1 ? 's' : ''}`);
    }
    setUploading(false);
    if (inputRef.current) inputRef.current.value = '';
  };

  const removeImage = async (url: string, index: number) => {
    // Try to delete from bucket if it's one of our uploads
    try {
      const marker = '/product-images/';
      const idx = url.indexOf(marker);
      if (idx !== -1) {
        const path = url.slice(idx + marker.length).split('?')[0];
        if (path) await supabase.storage.from('product-images').remove([path]);
      }
    } catch {
      // ignore — still remove from list
    }
    onChange(images.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      <input
        ref={inputRef}
        type="file"
        accept={ALLOWED.join(',')}
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      <Button
        type="button"
        variant="outline"
        className="w-full h-24 border-dashed flex flex-col gap-2"
        onClick={() => inputRef.current?.click()}
        disabled={uploading || images.length >= maxImages}
      >
        {uploading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-xs">Uploading...</span>
          </>
        ) : (
          <>
            <Upload className="h-5 w-5" />
            <span className="text-xs">
              {images.length >= maxImages
                ? `Maximum ${maxImages} images reached`
                : `Click to upload (${images.length}/${maxImages}) · max ${MAX_SIZE_MB}MB each`}
            </span>
          </>
        )}
      </Button>

      {images.length > 0 ? (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {images.map((url, i) => (
            <div
              key={`${url}-${i}`}
              className="relative group aspect-square rounded-lg overflow-hidden border bg-muted"
            >
              <img
                src={url}
                alt={`Product ${i + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = '/placeholder.svg';
                }}
              />
              {i === 0 && (
                <div className="absolute top-1 left-1 bg-primary text-primary-foreground text-[10px] font-medium px-1.5 py-0.5 rounded">
                  Cover
                </div>
              )}
              <button
                type="button"
                onClick={() => removeImage(url, i)}
                className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Remove image"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-6 text-muted-foreground text-xs flex flex-col items-center gap-2">
          <ImageIcon className="h-8 w-8 opacity-40" />
          No images yet — first uploaded image becomes the cover
        </div>
      )}
    </div>
  );
}
