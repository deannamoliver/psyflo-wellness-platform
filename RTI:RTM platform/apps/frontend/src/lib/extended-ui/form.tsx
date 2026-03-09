import {
  type FieldMetadata,
  type FormMetadata,
  FormProvider,
  getFormProps,
  getInputProps,
  getTextareaProps,
} from "@conform-to/react";
import { useControl } from "@conform-to/react/future";
import { format } from "date-fns";
import { REGEXP_ONLY_DIGITS_AND_CHARS } from "input-otp";
import { Calendar as CalendarIcon } from "lucide-react";
import { useEffect, useRef } from "react";
import { Button } from "@/lib/core-ui/button";
import { Calendar } from "@/lib/core-ui/calendar";
import { Checkbox } from "@/lib/core-ui/checkbox";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/lib/core-ui/input-otp";
import { Label } from "@/lib/core-ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/lib/core-ui/popover";
import { RadioGroup, RadioGroupItem } from "@/lib/core-ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/lib/core-ui/select";
import { Slider } from "@/lib/core-ui/slider";
import { Switch } from "@/lib/core-ui/switch";
import { Textarea } from "@/lib/core-ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "@/lib/core-ui/toggle-group";
import { Small } from "@/lib/core-ui/typography";
import { Input } from "@/lib/extended-ui/input";
import { cn } from "@/lib/tailwind-utils";

export function useFormPersist<
  Schema extends Record<string, unknown> = Record<string, unknown>,
>(form: FormMetadata<Schema>) {
  useEffect(() => {
    const preventDefault = (event: Event) => {
      if (event.target === document.forms.namedItem(form.id)) {
        event.preventDefault();
      }
    };

    document.addEventListener("reset", preventDefault, true);

    return () => {
      document.removeEventListener("reset", preventDefault, true);
    };
  }, [form.id]);
}

function FormErrors({ errors }: { errors: string[] | undefined }) {
  if (!errors || errors.length === 0) {
    return null;
  }

  return (
    <div className="text-destructive text-sm">
      {errors?.map((error) => (
        <div key={error}>{error}</div>
      ))}
    </div>
  );
}

export function Form<
  Schema extends Record<string, unknown> = Record<string, unknown>,
>({
  form,
  action,
  children,
  className,
}: {
  form: FormMetadata<Schema>;
  action: (payload: FormData) => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <FormProvider context={form.context}>
      <form action={action} {...getFormProps(form)} className={className}>
        {children}
      </form>
    </FormProvider>
  );
}

function FormField({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn("flex flex-col gap-2", className)}>{children}</div>;
}

type BaseFormFieldProps<Schema> = {
  field: FieldMetadata<Schema>;
  label: string;
  className?: string;
};

type FormInputProps = BaseFormFieldProps<string | number> &
  Omit<
    React.ComponentProps<typeof Input>,
    "type" | "defaultValue" | "value" | "onChange" | "disabled"
  > & {
    type: "text" | "email" | "password" | "number" | "tel" | "url" | "search";
    inputClassName?: string;
  };

export function FormInput({
  label,
  field,
  type,
  readOnly,
  className,
  inputClassName,
  ...props
}: FormInputProps) {
  return (
    <FormField className={className}>
      <Label htmlFor={field.id}>{label}</Label>
      <Input
        {...props}
        {...getInputProps(field, { type: type })}
        className={cn(
          readOnly && "pointer-events-none cursor-not-allowed opacity-50",
          inputClassName,
        )}
      />
      <FormErrors errors={field.errors} />
    </FormField>
  );
}

type FormTextareaProps = BaseFormFieldProps<string | number> &
  Omit<
    React.ComponentProps<typeof Textarea>,
    "type" | "defaultValue" | "value" | "onChange" | "disabled"
  > & {
    inputClassName?: string;
  };

export function FormTextarea({
  label,
  field,
  readOnly,
  className,
  inputClassName,
  ...props
}: FormTextareaProps) {
  return (
    <FormField className={className}>
      <Label htmlFor={field.id}>{label}</Label>
      <Textarea
        {...props}
        {...getTextareaProps(field)}
        className={cn(
          readOnly && "pointer-events-none cursor-not-allowed opacity-50",
          inputClassName,
        )}
      />
      <FormErrors errors={field.errors} />
    </FormField>
  );
}

type FormSelectProps = BaseFormFieldProps<string> &
  Omit<
    React.ComponentProps<typeof Select>,
    "defaultValue" | "value" | "onValueChange" | "onOpenChange" | "disabled"
  > & {
    options: { label: string; value: string }[];
    placeholder?: string;
    readOnly?: boolean;
    triggerClassName?: string;
  };

export function FormSelect({
  field,
  label,
  options,
  placeholder,
  readOnly,
  className,
  triggerClassName,
  ...props
}: FormSelectProps) {
  const selectRef = useRef<React.ComponentRef<typeof SelectTrigger>>(null);
  const control = useControl({
    defaultValue: field.defaultValue,
    onFocus: () => selectRef.current?.focus(),
  });

  return (
    <FormField className={className}>
      <Label htmlFor={field.id}>{label}</Label>
      <input name={field.name} ref={control.register} hidden />
      <Select
        {...props}
        value={control.value}
        onValueChange={(value) => control.change(value)}
        onOpenChange={(open) => {
          if (!open) {
            control.blur();
          }
        }}
      >
        <SelectTrigger
          ref={selectRef}
          className={cn(
            "w-full",
            readOnly && "pointer-events-none cursor-not-allowed opacity-50",
            triggerClassName,
          )}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((item) => (
            <SelectItem key={item.value} value={item.value}>
              {item.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <FormErrors errors={field.errors} />
    </FormField>
  );
}

type FormCheckboxProps = BaseFormFieldProps<boolean> &
  Omit<
    React.ComponentProps<typeof Checkbox>,
    | "ref"
    | "defaultValue"
    | "value"
    | "defaultChecked"
    | "checked"
    | "onCheckedChange"
    | "onBlur"
    | "disabled"
  > & {
    readOnly?: boolean;
    itemClassName?: string;
  };

export function FormCheckbox({
  field,
  label,
  readOnly,
  className,
  itemClassName,
  ...props
}: FormCheckboxProps) {
  const checkboxRef = useRef<React.ComponentRef<typeof Checkbox>>(null);
  const control = useControl({
    defaultChecked: field.defaultChecked,
    onFocus() {
      checkboxRef.current?.focus();
    },
  });

  return (
    <FormField className={className}>
      <input type="checkbox" ref={control.register} name={field.name} hidden />
      <div
        className={cn("flex items-center space-x-3 space-y-0", itemClassName)}
      >
        <Label htmlFor={field.id}>{label}</Label>
        <Checkbox
          {...props}
          ref={checkboxRef}
          checked={control.checked}
          onCheckedChange={(checked) => control.change(checked)}
          onBlur={() => control.blur()}
          className={cn(
            readOnly && "pointer-events-none cursor-not-allowed opacity-50",
          )}
        />
      </div>
      <FormErrors errors={field.errors} />
    </FormField>
  );
}

type FormRadioGroupProps = BaseFormFieldProps<string> &
  Omit<
    React.ComponentProps<typeof RadioGroup>,
    "ref" | "defaultValue" | "value" | "onValueChange" | "onBlur" | "disabled"
  > & {
    options: { label: string; value: string }[];
    readOnly?: boolean;
    groupClassName?: string;
    itemClassName?: string;
  };

export function FormRadioGroup({
  field,
  label,
  options,
  readOnly,
  className,
  groupClassName,
  itemClassName,
  ...props
}: FormRadioGroupProps) {
  const radioGroupRef = useRef<React.ComponentRef<typeof RadioGroup>>(null);
  const control = useControl({
    defaultValue: field.defaultValue,
    onFocus() {
      radioGroupRef.current?.focus();
    },
  });

  return (
    <FormField className={className}>
      <Label htmlFor={field.id}>{label}</Label>
      <input ref={control.register} name={field.name} hidden />
      <RadioGroup
        {...props}
        ref={radioGroupRef}
        value={control.value ?? ""}
        onValueChange={(value) => control.change(value)}
        onBlur={() => control.blur()}
        className={cn(
          "flex gap-4",
          readOnly && "pointer-events-none cursor-not-allowed opacity-50",
          groupClassName,
        )}
      >
        {options.map((item) => (
          <div
            className={cn("flex items-center gap-2", itemClassName)}
            key={item.value}
          >
            <RadioGroupItem
              id={`${field.id}-${item.value}`}
              value={item.value}
            />
            <label htmlFor={`${field.id}-${item.value}`}>{item.label}</label>
          </div>
        ))}
      </RadioGroup>
      <FormErrors errors={field.errors} />
    </FormField>
  );
}

type FormSwitchProps = BaseFormFieldProps<boolean> &
  Omit<
    React.ComponentProps<typeof Switch>,
    | "ref"
    | "defaultValue"
    | "value"
    | "defaultChecked"
    | "checked"
    | "onCheckedChange"
    | "onBlur"
    | "disabled"
  > & {
    readOnly?: boolean;
  };

export function FormSwitch({
  field,
  label,
  readOnly,
  className,
  ...props
}: FormSwitchProps) {
  const switchRef = useRef<React.ComponentRef<typeof Switch>>(null);
  const control = useControl({
    defaultChecked: field.defaultChecked,
    onFocus: () => switchRef.current?.focus(),
  });

  return (
    <FormField className={className}>
      <Label htmlFor={field.id}>{label}</Label>
      <input type="checkbox" name={field.name} ref={control.register} hidden />
      <Switch
        {...props}
        ref={switchRef}
        checked={control.checked}
        onCheckedChange={(checked) => control.change(checked)}
        onBlur={() => control.blur()}
        className={cn(
          readOnly && "pointer-events-none cursor-not-allowed opacity-50",
        )}
      />
      <FormErrors errors={field.errors} />
    </FormField>
  );
}

type FormDatePickerProps = BaseFormFieldProps<string> & {
  readOnly?: boolean;
  triggerClassName?: string;
};

export function FormDatePicker({
  field,
  label,
  readOnly,
  className,
  triggerClassName,
}: FormDatePickerProps) {
  const triggerRef = useRef<React.ComponentRef<typeof Button>>(null);
  const control = useControl({
    defaultValue: field.defaultValue
      ? new Date(field.defaultValue).toISOString()
      : undefined,
    onFocus: () => triggerRef.current?.focus(),
  });

  return (
    <FormField className={className}>
      <Label htmlFor={field.id}>{label}</Label>
      <input ref={control.register} name={field.name} hidden />
      <Popover
        onOpenChange={(open) => {
          if (!open) {
            control.blur();
          }
        }}
      >
        <PopoverTrigger asChild>
          <Button
            ref={triggerRef}
            variant="outline"
            className={cn(
              "justify-start text-left font-normal",
              !control.value && "text-muted-foreground",
              readOnly && "pointer-events-none cursor-not-allowed opacity-50",
              triggerClassName,
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {control.value ? (
              format(control.value, "PPP")
            ) : (
              <span>Pick a date</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar
            mode="single"
            selected={control.value ? new Date(control.value) : undefined}
            onSelect={(value) => control.change(value?.toISOString() ?? "")}
            captionLayout="dropdown"
            autoFocus
          />
        </PopoverContent>
      </Popover>
      <FormErrors errors={field.errors} />
    </FormField>
  );
}

type FormSliderProps = BaseFormFieldProps<number> &
  Omit<
    React.ComponentProps<typeof Slider>,
    "defaultValue" | "value" | "onValueChange" | "onBlur" | "disabled"
  > & {
    readOnly?: boolean;
  };

export function FormSlider({
  field,
  label,
  readOnly,
  className,
  ...props
}: FormSliderProps) {
  const sliderRef = useRef<React.ComponentRef<typeof Slider>>(null);
  const control = useControl({
    defaultValue: field.defaultValue,
    onFocus() {
      const sliderSpan = sliderRef.current?.querySelector('[role="slider"]');
      if (sliderSpan instanceof HTMLElement) {
        sliderSpan.focus();
      }
    },
  });

  return (
    <FormField className={className}>
      <Label htmlFor={field.id}>{label}</Label>
      <input name={field.name} ref={control.register} hidden />
      <div className="flex items-center gap-4">
        <Slider
          {...props}
          ref={sliderRef}
          value={[control.value ? parseFloat(control.value) : 0]}
          onValueChange={(numbers) => {
            control.change(numbers[0]?.toString() ?? "");
          }}
          onBlur={() => control.blur()}
          className={cn(
            readOnly && "pointer-events-none cursor-not-allowed opacity-50",
          )}
        />
        <Small className="w-8 text-muted-foreground">{control.value}</Small>
      </div>
      <FormErrors errors={field.errors} />
    </FormField>
  );
}

type SingleToggleGroupProps = BaseFormFieldProps<string> &
  Omit<
    React.ComponentProps<typeof ToggleGroup>,
    | "type"
    | "ref"
    | "defaultValue"
    | "value"
    | "onValueChange"
    | "onBlur"
    | "disabled"
  > & {
    options: { value: string; label: string }[];
    readOnly?: boolean;
  };

export function FormSingleToggleGroup({
  field,
  label,
  options,
  readOnly,
  className,
  ...props
}: SingleToggleGroupProps) {
  const toggleGroupRef = useRef<React.ComponentRef<typeof ToggleGroup>>(null);
  const control = useControl({
    defaultValue: field.defaultValue,
    onFocus: () => toggleGroupRef.current?.focus(),
  });

  return (
    <FormField className={className}>
      <Label htmlFor={field.id}>{label}</Label>
      <input name={field.name} ref={control.register} hidden />
      <ToggleGroup
        {...props}
        type="single"
        ref={toggleGroupRef}
        value={control.value}
        onValueChange={(value) => control.change(value)}
        onBlur={() => control.blur()}
        className={cn(
          readOnly && "pointer-events-none cursor-not-allowed opacity-50",
        )}
      >
        {options.map((item) => (
          <ToggleGroupItem key={item.value} value={item.value}>
            {item.label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
      <FormErrors errors={field.errors} />
    </FormField>
  );
}

type FormInputOTPProps = BaseFormFieldProps<string> & {
  length?: number;
  pattern?: string;
  readOnly?: boolean;
  inputClassName?: string;
  groupClassName?: string;
  slotClassName?: string;
};

export function FormInputOTP({
  field,
  label,
  length = 6,
  pattern = REGEXP_ONLY_DIGITS_AND_CHARS,
  readOnly,
  className,
  inputClassName,
  groupClassName,
  slotClassName,
  ...props
}: FormInputOTPProps) {
  const inputOTPRef = useRef<React.ElementRef<typeof InputOTP>>(null);
  const control = useControl({
    defaultValue: field.defaultValue,
    onFocus() {
      inputOTPRef.current?.focus();
    },
  });

  return (
    <FormField className={className}>
      <Label htmlFor={field.id}>{label}</Label>
      <input ref={control.register} name={field.name} hidden />
      <InputOTP
        {...props}
        ref={inputOTPRef}
        value={control.value}
        onChange={(value) => control.change(value)}
        onBlur={() => {
          // InputOTP calls the onBlur handler when the input is focused
          // Which should not happen, so we comment this out for now
          // control.blur();
        }}
        maxLength={length}
        pattern={pattern}
        containerClassName={inputClassName}
        className={cn(
          readOnly && "pointer-events-none cursor-not-allowed opacity-50",
        )}
      >
        <InputOTPGroup className={groupClassName}>
          {new Array(length).fill(0).map((_, index) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: This is a valid use case
            <InputOTPSlot key={index} index={index} className={slotClassName} />
          ))}
        </InputOTPGroup>
      </InputOTP>
      <FormErrors errors={field.errors} />
    </FormField>
  );
}
