import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useCallback } from 'react';

interface ThemeColorPickerProps {
  label: string;
  hslValue: string;
  onChange: (value: string) => void;
}

function hslStringToHex(hsl: string): string {
  const parts = hsl.trim().split(/\s+/).map(v => parseFloat(v));
  if (parts.length < 3) return '#000000';
  const [h, s, l] = [parts[0], parts[1] / 100, parts[2] / 100];
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

function hexToHsl(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) * 60; break;
      case g: h = ((b - r) / d + 2) * 60; break;
      case b: h = ((r - g) / d + 4) * 60; break;
    }
  }
  return `${Math.round(h)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

export function ThemeColorPicker({ label, hslValue, onChange }: ThemeColorPickerProps) {
  const hexValue = hslStringToHex(hslValue);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(hexToHsl(e.target.value));
  }, [onChange]);

  return (
    <div className="flex items-center gap-3">
      <input
        type="color"
        value={hexValue}
        onChange={handleChange}
        className="w-10 h-10 rounded-lg border border-border cursor-pointer shrink-0"
      />
      <div className="flex-1 min-w-0">
        <Label className="text-xs text-muted-foreground">{label}</Label>
        <p className="text-xs font-mono truncate">{hslValue}</p>
      </div>
    </div>
  );
}
