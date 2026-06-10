import CustomSelect from '@/components/ui/CustomSelect';
import { LANGUAGES } from './constants';

export default function LanguageSelector({ value, onChange, disabled }) {
    const options = LANGUAGES.map((lang) => ({
        value: lang.value,
        label: lang.label,
        icon: <span className="font-mono text-[10px] text-muted-foreground w-5 inline-block">{lang.icon}</span>
    }));

    return (
        <CustomSelect
            value={value}
            onChange={onChange}
            disabled={disabled}
            options={options}
            className="h-8 w-32 bg-secondary/50 border-border text-[11px] font-medium"
        />
    );
}
