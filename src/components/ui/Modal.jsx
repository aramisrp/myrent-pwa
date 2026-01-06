import { useEffect } from "react"
import { createPortal } from "react-dom"
import { X } from "lucide-react"
import { cn } from "../../lib/utils"
import { Button } from "./Button"

export function Modal({ isOpen, onClose, title, children, className }) {
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === "Escape") onClose()
        }
        if (isOpen) {
            document.addEventListener("keydown", handleEscape)
            document.body.style.overflow = "hidden"
        }
        return () => {
            document.removeEventListener("keydown", handleEscape)
            document.body.style.overflow = "unset"
        }
    }, [isOpen, onClose])

    if (!isOpen) return null

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div
                className={cn(
                    "relative w-full max-w-lg rounded-lg bg-background p-6 shadow-lg animate-in fade-in zoom-in duration-200",
                    className
                )}
            >
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold">{title}</h2>
                    <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
                        <X className="h-4 w-4" />
                    </Button>
                </div>
                {children}
            </div>
        </div>,
        document.body
    )
}
