import { Switch as SwitchPrimitive } from "@base-ui/react/switch"
import { cn } from "@/lib/utils"

function Switch({
  className,
  ...props
}: SwitchPrimitive.Root.Props) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        "group/switch peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors outline-none",
        "bg-muted-foreground/30 data-[checked]:bg-primary",
        "focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:border-ring",
        "disabled:pointer-events-none disabled:opacity-50",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        className={cn(
          "pointer-events-none block h-4 w-4 rounded-full bg-white shadow-sm ring-0 transition-transform",
          "translate-x-0.5 group-data-[checked]/switch:translate-x-[1.375rem]"
        )}
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
