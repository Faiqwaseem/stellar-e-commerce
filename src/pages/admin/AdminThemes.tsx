import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { Palette, Check, Trash2, Plus, Copy, Eye, Save, RotateCcw, Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { ThemeColorPicker } from '@/components/admin/ThemeColorPicker';
import {
  useThemeStore,
  presetThemes,
  applyTheme,
  type ThemeConfig,
  type ThemeColors,
} from '@/stores/themeStore';

const colorLabels: Record<keyof ThemeColors, string> = {
  background: 'Background',
  foreground: 'Text',
  card: 'Card',
  cardForeground: 'Card Text',
  primary: 'Primary',
  primaryForeground: 'Primary Text',
  secondary: 'Secondary',
  secondaryForeground: 'Secondary Text',
  muted: 'Muted',
  mutedForeground: 'Muted Text',
  accent: 'Accent',
  accentForeground: 'Accent Text',
  destructive: 'Destructive',
  border: 'Border',
  ring: 'Focus Ring',
};

const fontOptions = [
  "'Plus Jakarta Sans'",
  "'Space Grotesk'",
  "'Inter'",
  "'Outfit'",
  "'DM Sans'",
  "'Poppins'",
  "'Nunito Sans'",
  "'Raleway'",
  "'Playfair Display'",
  "'Cormorant Garamond'",
  "'Sora'",
  "'Orbitron'",
  "'Montserrat'",
  "'Lato'",
  "'Roboto'",
];

function ThemePreviewCard({ theme, isDark }: { theme: ThemeConfig; isDark: boolean }) {
  const colors = isDark ? theme.darkColors : theme.colors;
  return (
    <div
      className="rounded-lg border p-4 space-y-3"
      style={{
        backgroundColor: `hsl(${colors.background})`,
        borderColor: `hsl(${colors.border})`,
        color: `hsl(${colors.foreground})`,
      }}
    >
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full" style={{ backgroundColor: `hsl(${colors.primary})` }} />
        <div className="w-8 h-8 rounded-full" style={{ backgroundColor: `hsl(${colors.secondary})` }} />
        <div className="w-8 h-8 rounded-full" style={{ backgroundColor: `hsl(${colors.accent})` }} />
        <div className="w-8 h-8 rounded-full" style={{ backgroundColor: `hsl(${colors.muted})` }} />
      </div>
      <div className="space-y-1">
        <div className="text-sm font-bold" style={{ color: `hsl(${colors.foreground})` }}>Sample Heading</div>
        <div className="text-xs" style={{ color: `hsl(${colors.mutedForeground})` }}>Muted description text</div>
      </div>
      <div className="flex gap-2">
        <div
          className="px-3 py-1 rounded-md text-xs font-medium"
          style={{ backgroundColor: `hsl(${colors.primary})`, color: `hsl(${colors.primaryForeground})` }}
        >
          Button
        </div>
        <div
          className="px-3 py-1 rounded-md text-xs font-medium border"
          style={{ borderColor: `hsl(${colors.border})`, color: `hsl(${colors.foreground})` }}
        >
          Outline
        </div>
      </div>
      <div
        className="rounded-md p-2 text-xs"
        style={{ backgroundColor: `hsl(${colors.card})`, borderColor: `hsl(${colors.border})`, border: '1px solid' }}
      >
        <span style={{ color: `hsl(${colors.cardForeground})` }}>Card content preview</span>
      </div>
    </div>
  );
}

export default function AdminThemes() {
  const { toast } = useToast();
  const { theme: currentMode } = useTheme();
  const isDark = currentMode === 'dark';
  const {
    activeThemeId,
    setActiveTheme,
    saveCustomTheme,
    deleteCustomTheme,
    updateCustomTheme,
    getActiveTheme,
    getAllThemes,
  } = useThemeStore();

  const allThemes = getAllThemes();

  const [editingTheme, setEditingTheme] = useState<ThemeConfig | null>(null);
  const [newThemeName, setNewThemeName] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);

  // Apply active theme whenever it changes
  useEffect(() => {
    const theme = getActiveTheme();
    applyTheme(theme, isDark);
  }, [activeThemeId, isDark, getActiveTheme]);

  const handleActivate = (id: string) => {
    setActiveTheme(id);
    toast({ title: 'Theme activated', description: 'The theme has been applied across the site.' });
  };

  const handleDuplicate = (theme: ThemeConfig) => {
    const newId = `custom-${Date.now()}`;
    const newTheme: ThemeConfig = {
      ...theme,
      id: newId,
      name: `${theme.name} (Copy)`,
      isPreset: false,
    };
    saveCustomTheme(newTheme);
    toast({ title: 'Theme duplicated', description: 'You can now edit the copy.' });
  };

  const handleDelete = (id: string) => {
    deleteCustomTheme(id);
    toast({ title: 'Theme deleted' });
  };

  const handleEdit = (theme: ThemeConfig) => {
    setEditingTheme({ ...theme, colors: { ...theme.colors }, darkColors: { ...theme.darkColors }, typography: { ...theme.typography } });
  };

  const handleSaveEdit = () => {
    if (!editingTheme) return;
    updateCustomTheme(editingTheme.id, editingTheme);
    if (editingTheme.id === activeThemeId) {
      applyTheme(editingTheme, isDark);
    }
    setEditingTheme(null);
    toast({ title: 'Theme updated' });
  };

  const handleCreateNew = () => {
    if (!newThemeName.trim()) return;
    const base = presetThemes[0];
    const newTheme: ThemeConfig = {
      ...base,
      id: `custom-${Date.now()}`,
      name: newThemeName.trim(),
      isPreset: false,
      colors: { ...base.colors },
      darkColors: { ...base.darkColors },
      typography: { ...base.typography },
    };
    saveCustomTheme(newTheme);
    setNewThemeName('');
    setDialogOpen(false);
    setEditingTheme(newTheme);
    toast({ title: 'Theme created', description: 'Customize it in the editor.' });
  };

  const updateEditColor = (mode: 'colors' | 'darkColors', key: keyof ThemeColors, value: string) => {
    if (!editingTheme) return;
    setEditingTheme({
      ...editingTheme,
      [mode]: { ...editingTheme[mode], [key]: value },
    });
  };

  const previewTheme = editingTheme || getActiveTheme();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-bold flex items-center gap-2">
            <Palette className="h-6 w-6 text-primary" />
            Theme Management
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            Customize colors and typography. Changes apply instantly across the entire site.
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-primary border-0">
              <Plus className="h-4 w-4 mr-2" />
              New Theme
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Theme</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div>
                <Label>Theme Name</Label>
                <Input
                  placeholder="My Custom Theme"
                  value={newThemeName}
                  onChange={(e) => setNewThemeName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCreateNew()}
                />
              </div>
              <Button onClick={handleCreateNew} disabled={!newThemeName.trim()} className="w-full">
                Create & Customize
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {editingTheme ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-bold">Editing: {editingTheme.name}</h3>
              <Badge variant="outline">Custom</Badge>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setEditingTheme(null)}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={handleSaveEdit} className="gradient-primary border-0">
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Editor */}
            <div className="lg:col-span-2 space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Theme Name</CardTitle>
                </CardHeader>
                <CardContent>
                  <Input
                    value={editingTheme.name}
                    onChange={(e) => setEditingTheme({ ...editingTheme, name: e.target.value })}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Typography</CardTitle>
                </CardHeader>
                <CardContent className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-muted-foreground">Body Font</Label>
                    <Select
                      value={editingTheme.typography.fontSans}
                      onValueChange={(v) => setEditingTheme({ ...editingTheme, typography: { ...editingTheme.typography, fontSans: v } })}
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {fontOptions.map(f => (
                          <SelectItem key={f} value={f}>{f.replace(/'/g, '')}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Display Font</Label>
                    <Select
                      value={editingTheme.typography.fontDisplay}
                      onValueChange={(v) => setEditingTheme({ ...editingTheme, typography: { ...editingTheme.typography, fontDisplay: v } })}
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {fontOptions.map(f => (
                          <SelectItem key={f} value={f}>{f.replace(/'/g, '')}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Tabs defaultValue="light">
                <TabsList>
                  <TabsTrigger value="light">Light Mode Colors</TabsTrigger>
                  <TabsTrigger value="dark">Dark Mode Colors</TabsTrigger>
                </TabsList>
                <TabsContent value="light">
                  <Card>
                    <CardContent className="pt-4 grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {(Object.keys(colorLabels) as (keyof ThemeColors)[]).map((key) => (
                        <ThemeColorPicker
                          key={key}
                          label={colorLabels[key]}
                          hslValue={editingTheme.colors[key]}
                          onChange={(v) => updateEditColor('colors', key, v)}
                        />
                      ))}
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="dark">
                  <Card>
                    <CardContent className="pt-4 grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {(Object.keys(colorLabels) as (keyof ThemeColors)[]).map((key) => (
                        <ThemeColorPicker
                          key={key}
                          label={colorLabels[key]}
                          hslValue={editingTheme.darkColors[key]}
                          onChange={(v) => updateEditColor('darkColors', key, v)}
                        />
                      ))}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>

            {/* Live Preview */}
            <div className="space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    Live Preview
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-xs text-muted-foreground mb-2 block">Light Mode</Label>
                    <ThemePreviewCard theme={editingTheme} isDark={false} />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground mb-2 block">Dark Mode</Label>
                    <ThemePreviewCard theme={editingTheme} isDark={true} />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      ) : (
        /* Theme Gallery */
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {allThemes.map((theme) => (
            <Card
              key={theme.id}
              className={`relative transition-all hover:shadow-lg ${
                theme.id === activeThemeId ? 'ring-2 ring-primary' : ''
              }`}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">{theme.name}</CardTitle>
                  <div className="flex items-center gap-1">
                    {theme.isPreset && <Badge variant="secondary" className="text-[10px]">Preset</Badge>}
                    {theme.id === activeThemeId && (
                      <Badge className="text-[10px] bg-primary text-primary-foreground">Active</Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <ThemePreviewCard theme={theme} isDark={isDark} />

                <div className="text-xs text-muted-foreground">
                  Fonts: {theme.typography.fontSans.replace(/'/g, '')} / {theme.typography.fontDisplay.replace(/'/g, '')}
                </div>

                <div className="flex gap-1.5 flex-wrap">
                  {theme.id !== activeThemeId && (
                    <Button size="sm" variant="default" onClick={() => handleActivate(theme.id)} className="text-xs h-7">
                      <Check className="h-3 w-3 mr-1" />
                      Activate
                    </Button>
                  )}
                  <Button size="sm" variant="outline" onClick={() => handleDuplicate(theme)} className="text-xs h-7">
                    <Copy className="h-3 w-3 mr-1" />
                    Duplicate
                  </Button>
                  {!theme.isPreset && (
                    <>
                      <Button size="sm" variant="outline" onClick={() => handleEdit(theme)} className="text-xs h-7">
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(theme.id)}
                        className="text-xs h-7 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
