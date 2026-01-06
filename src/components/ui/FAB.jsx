import { Plus } from "lucide-react"
import { Button } from "./Button"
import { cn } from "../../lib/utils"

export function FAB({ onClick, className, ...props }) {
    return (
        <Button
            onClick={onClick}
            className={cn(
                "fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg",
                className
            )}
            {...props}
        >
            <Plus className="h-6 w-6" />
        </Button>
    )
}
