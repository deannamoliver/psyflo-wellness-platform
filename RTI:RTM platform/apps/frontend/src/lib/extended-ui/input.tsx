"use client";

import { ArrowBigUpDash, EyeIcon, EyeOffIcon } from "lucide-react";
import * as React from "react";
import { Input as ShadcnInput } from "@/lib/core-ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/lib/core-ui/popover";
import { cn } from "@/lib/tailwind-utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactElement;
  ref?: React.Ref<HTMLInputElement>;
}

// Reference: https://github.com/shadcn-ui/ui/discussions/1552#discussioncomment-9150197
export function Input({ icon, type, ref, className, ...props }: InputProps) {
  const [showPassword, setShowPassword] = React.useState(false);
  const [capsLockActive, setCapsLockActive] = React.useState(false);

  const handleKeyPress: React.KeyboardEventHandler<HTMLInputElement> = (
    event,
  ) => {
    const capsLockOn = event.getModifierState("CapsLock");
    setCapsLockActive(capsLockOn);
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  const inputClasses = cn(
    "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:font-medium file:text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
    icon && "pl-10",
    type === "password" && (!capsLockActive ? "pr-8" : "pr-16"),
    className,
  );

  return (
    <div className="group relative">
      {icon && (
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center py-2 pl-3">
          {icon}
        </div>
      )}
      <ShadcnInput
        type={type === "password" && showPassword ? "text" : type}
        className={inputClasses}
        onKeyDown={handleKeyPress}
        ref={ref}
        {...props}
      />
      {type === "password" && (
        <div className="-translate-y-1/2 absolute top-1/2 right-0 flex items-center gap-x-1 py-2 pr-3">
          {showPassword ? (
            <EyeOffIcon
              className="cursor-pointer"
              onClick={togglePasswordVisibility}
              size={20}
            />
          ) : (
            <EyeIcon
              className="cursor-pointer"
              onClick={togglePasswordVisibility}
              size={20}
            />
          )}
          {capsLockActive && type === "password" && (
            <Popover>
              <PopoverTrigger asChild>
                <ArrowBigUpDash size={20} className="cursor-pointer" />
              </PopoverTrigger>
              <PopoverContent className="w-auto p-2">
                <p>Caps Lock is on!</p>
              </PopoverContent>
            </Popover>
          )}
        </div>
      )}
    </div>
  );
}

Input.displayName = "ExtendedInput";
