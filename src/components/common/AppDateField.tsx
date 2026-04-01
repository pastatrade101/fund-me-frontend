import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";

type AppDateFieldProps = {
    label: string;
    value: string;
    onChange: (value: string) => void;
    helperText?: string;
    disabled?: boolean;
    disablePast?: boolean;
};

export function AppDateField({
    label,
    value,
    onChange,
    helperText,
    disabled = false,
    disablePast = false
}: AppDateFieldProps) {
    return (
        <DatePicker
            label={label}
            value={value ? dayjs(value) : null}
            onChange={(nextValue) => onChange(nextValue ? nextValue.format("YYYY-MM-DD") : "")}
            format="DD/MM/YYYY"
            disabled={disabled}
            disablePast={disablePast}
            minDate={disablePast ? dayjs().startOf("day") : undefined}
            reduceAnimations
            slotProps={{
                textField: {
                    fullWidth: true,
                    helperText
                }
            }}
        />
    );
}
