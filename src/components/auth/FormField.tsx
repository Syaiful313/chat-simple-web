import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UseFormRegister, FieldErrors, FieldValues } from "react-hook-form";

interface FormFieldProps<T extends FieldValues> {
  id: string;
  label: string;
  type?: string;
  placeholder: string;
  register: UseFormRegister<T>;
  errors: FieldErrors<T>;
  disabled?: boolean;
}

export function FormField<T extends FieldValues>({
  id,
  label,
  type = "text",
  placeholder,
  register,
  errors,
  disabled = false,
}: FormFieldProps<T>) {
  const error = errors[id];

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type={type}
        placeholder={placeholder}
        {...register(id as any)}
        disabled={disabled}
      />
      {error && (
        <p className="text-xs text-red-600">{error.message as string}</p>
      )}
    </div>
  );
}
