import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from '@/components/ui/select';
import { LANGUAGES } from './constants';
export default function LanguageSelector({ value, onChange, disabled }) {
    return (<Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger className="h-8 w-32 bg-secondary/50 border-border text-[11px] font-medium">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {LANGUAGES.map((lang) => (<SelectItem key={lang.value} value={lang.value} className="text-xs">
            <span className="flex items-center gap-2">
              <span className="font-mono text-[10px] text-muted-foreground w-5">{lang.icon}</span>
              {lang.label}
            </span>
          </SelectItem>))}
      </SelectContent>
    </Select>);
}
