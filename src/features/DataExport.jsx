import { db } from "../db"
import { Button } from "../components/ui/Button"
import { Download } from "lucide-react"

export function DataExport() {
    const handleExport = async () => {
        try {
            const properties = await db.properties.toArray()
            const dataStr = JSON.stringify(properties, null, 2)
            const blob = new Blob([dataStr], { type: "application/json" })
            const url = URL.createObjectURL(blob)

            const date = new Date().toISOString().split('T')[0]
            const link = document.createElement('a')
            link.href = url
            link.download = `myrent_backup_${date}.json`
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)

            URL.revokeObjectURL(url)
        } catch (error) {
            console.error("Export failed:", error)
            alert("Erro ao exportar dados.")
        }
    }

    return (
        <Button variant="outline" onClick={handleExport} className="gap-2">
            <Download className="h-4 w-4" />
            Backup
        </Button>
    )
}
