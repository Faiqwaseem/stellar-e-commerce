import { Languages } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTranslation } from '@/lib/i18n';

export function LanguageToggle() {
  const { lang, setLang } = useTranslation();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-xl" aria-label="Language">
          <Languages className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="rounded-xl">
        <DropdownMenuItem onClick={() => setLang('en')} className={lang === 'en' ? 'font-bold' : ''}>
          English
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setLang('ur')} className={lang === 'ur' ? 'font-bold' : ''}>
          اردو (Urdu)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
