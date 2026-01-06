import { Moon, Sun } from "lucide-react"
import { useEffect, useState } from "react"
import { Button } from "../components/ui/Button"

export function MainLayout({ children }) {
    const [theme, setTheme] = useState("light")

    useEffect(() => {
        if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
            setTheme("dark")
        }
    }, [])

    useEffect(() => {
        document.documentElement.classList.remove("light", "dark")
        document.documentElement.classList.add(theme)
    }, [theme])

    const toggleTheme = () => {
        setTheme(theme === "light" ? "dark" : "light")
    }

    return (
        <div className="min-h-screen bg-background text-foreground">
            <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container flex h-14 items-center justify-between px-4">
                    <h1 className="text-xl font-bold">MyRent</h1>
                    <Button variant="ghost" size="sm" onClick={toggleTheme}>
                        {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                    </Button>
                </div>
            </header>
            <main className="container px-4 py-6 pb-24">
                {children}
            </main>
        </div>
    )
}
