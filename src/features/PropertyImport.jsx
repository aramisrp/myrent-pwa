import { useState, useRef } from "react"
import { read, utils, writeFile } from "xlsx"
import { Upload, X, FileSpreadsheet, Loader2, Download } from "lucide-react"
import { Button } from "../components/ui/Button"
import { db } from "../db"
import { cn } from "../lib/utils"

export function PropertyImport({ onClose, onImportComplete }) {
    const [isDragging, setIsDragging] = useState(false)
    const [isImporting, setIsImporting] = useState(false)
    const [error, setError] = useState(null)
    const fileInputRef = useRef(null)

    const handleDragOver = (e) => {
        e.preventDefault()
        setIsDragging(true)
    }

    const handleDragLeave = () => {
        setIsDragging(false)
    }

    const handleDrop = (e) => {
        e.preventDefault()
        setIsDragging(false)
        const files = e.dataTransfer.files
        if (files.length > 0) {
            processFile(files[0])
        }
    }

    const handleFileSelect = (e) => {
        const files = e.target.files
        if (files.length > 0) {
            processFile(files[0])
        }
    }

    const downloadTemplate = () => {
        const headers = [
            "Região Administrativa", "ENDEREÇO", "TIPO", "QTD QUARTOS",
            "QTD BANHEIROS", "área total MT²", "VARANDA", "LAZER",
            "ACESSIBILIDADE", "METRÔ", "ALUGUEL", "CONDOMÍNIO",
            "IPTU", "RESIDENCIAL", "CONTATO"
        ]
        const worksheet = utils.aoa_to_sheet([headers])
        const workbook = utils.book_new()
        utils.book_append_sheet(workbook, worksheet, "Modelo")
        writeFile(workbook, "modelo_imoveis.xlsx")
    }

    const processFile = async (file) => {
        try {
            setIsImporting(true)
            setError(null)

            let importedProperties = []

            if (file.name.endsWith('.json')) {
                const text = await file.text()
                const json = JSON.parse(text)
                if (Array.isArray(json)) {
                    // Normalize/Validate JSON backup
                    importedProperties = json.map(p => ({
                        ...p,
                        // Ensure required fields exist or sanitize
                        created_at: p.created_at ? new Date(p.created_at) : new Date()
                    }))
                } else {
                    throw new Error("Arquivo JSON inválido. Esperado um array de imóveis.")
                }
            } else {
                // EXCEL/CSV Processing
                const buffer = await file.arrayBuffer()
                const workbook = read(buffer, { type: 'array' })
                const firstSheetName = workbook.SheetNames[0]
                const worksheet = workbook.Sheets[firstSheetName]

                // Get data as array of arrays to find header row
                const rawDataArray = utils.sheet_to_json(worksheet, { header: 1 })

                // Find header row (row containing "ENDEREÇO" or "ALUGUEL")
                let headerRowIndex = 0
                for (let i = 0; i < rawDataArray.length; i++) {
                    const row = rawDataArray[i]
                    if (row.some(cell => typeof cell === 'string' && (cell.toUpperCase().includes("ENDEREÇO") || cell.toUpperCase().includes("ALUGUEL")))) {
                        headerRowIndex = i
                        break
                    }
                }

                // Parse again starting from header row
                const jsonData = utils.sheet_to_json(worksheet, { range: headerRowIndex })

                if (jsonData.length === 0) {
                    throw new Error("O arquivo parece estar vazio.")
                }

                // Normalize keys to allow case-insensitive matching
                const normalizeKey = (key) => key.trim().toLowerCase()

                importedProperties = jsonData.map(row => {
                    // Create a normalized map for this row
                    const normalizedRow = {}
                    Object.keys(row).forEach(key => {
                        normalizedRow[normalizeKey(key)] = row[key]
                    })

                    const getValue = (keyContent) => {
                        // Try exact match first
                        let key = normalizeKey(keyContent)
                        if (normalizedRow[key] !== undefined) return normalizedRow[key]

                        // aliases
                        if (keyContent.includes("área total") || keyContent.includes("mt²") || keyContent.includes("m²")) {
                            if (normalizedRow["área total m²"] !== undefined) return normalizedRow["área total m²"]
                            if (normalizedRow["área total mt²"] !== undefined) return normalizedRow["área total mt²"]
                            if (normalizedRow["mt²"] !== undefined) return normalizedRow["mt²"]
                        }

                        return undefined
                    }

                    const region = getValue("Região Administrativa") || ""
                    const address = getValue("ENDEREÇO") || ""
                    const type = getValue("TIPO") || ""
                    const bedrooms = getValue("QTD QUARTOS") ? `${getValue("QTD QUARTOS")} quartos` : ""
                    const bathrooms = getValue("QTD BANHEIROS") ? `${getValue("QTD BANHEIROS")} banheiros` : ""
                    const area = getValue("área total MT²") ? `${getValue("área total MT²")}m²` : ""
                    const balcony = getValue("VARANDA") === "Sim" ? "Varanda" : ""
                    const leisure = getValue("LAZER") || ""
                    const accessibility = getValue("ACESSIBILIDADE") || ""
                    const metro = getValue("METRÔ") || ""
                    const contact = getValue("CONTATO") || ""
                    const listing_url = getValue("Link") || getValue("URL") || getValue("Site") || getValue("Anúncio") || ""

                    const residential = getValue("RESIDENCIAL") || ""
                    const residentialName = residential ? ` (${residential})` : ""

                    const rent = Number(getValue("ALUGUEL")) || 0
                    const condo = Number(getValue("CONDOMÍNIO")) || 0
                    const iptu = Number(getValue("IPTU")) || 0
                    const total = rent + condo + iptu

                    const tags = [
                        type,
                        bedrooms,
                        bathrooms,
                        balcony,
                        accessibility,
                        metro
                    ].filter(Boolean)

                    const notes = [
                        residential ? `Residencial: ${residential}` : null,
                        area ? `Área: ${area}` : null,
                        leisure ? `Lazer: ${leisure}` : null,
                        contact ? `Contato: ${contact}` : null,
                        region ? `Região: ${region}` : null
                    ].filter(Boolean).join("\n")

                    // Parse raw area for analytics
                    const rawArea = parseFloat(getValue("área total MT²") || getValue("área") || 0)

                    return {
                        title: `${type}${residentialName} em ${region || address}`.trim() || "Imóvel Importado",
                        address: address,
                        listing_url: listing_url,
                        region: region,
                        area: rawArea,
                        rent_value: rent,
                        condo_fee: condo,
                        iptu: iptu,
                        total_cost: total,
                        status: "Interessado",
                        tags: tags,
                        notes: notes,
                        created_at: new Date()
                    }
                })
            }

            // Filtering
            importedProperties = importedProperties.filter(prop => {
                // valid if it has an address OR a meaningful title (not just the default)
                // OR if it has a rent value > 0
                // For JSON backups, we assume valid if it has an ID or address
                return prop.address || prop.rent_value > 0 || (prop.title && prop.title !== "Imóvel Importado")
            })

            const propertiesToAdd = []
            let skippedCount = 0

            // Fetch existing addresses for duplicate checking
            // We use a Set for O(1) lookup
            const existingAddresses = new Set(await db.properties.orderBy("address").keys())

            importedProperties.forEach(prop => {
                if (prop.address && existingAddresses.has(prop.address)) {
                    skippedCount++
                } else {
                    // Add to both list and Set to prevent duplicates within the file itself
                    // Remove ID collision risk from backup
                    const { id, ...propWithoutId } = prop
                    propertiesToAdd.push(propWithoutId)
                    if (prop.address) existingAddresses.add(prop.address)
                }
            })

            if (propertiesToAdd.length > 0) {
                await db.properties.bulkAdd(propertiesToAdd)
            }

            let message = `${propertiesToAdd.length} imóveis importados com sucesso!`
            if (skippedCount > 0) {
                message += ` (${skippedCount} ignorados por duplicidade)`
            }

            onImportComplete(message) // Updated to expect a string, need to update parent or send string
            onClose()
        } catch (err) {
            console.error("Import error:", err)
            setError(err.message || "Falha ao importar arquivo.")
        } finally {
            setIsImporting(false)
        }
    }

    return (
        <div className="space-y-4">
            <div
                className={cn(
                    "border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer flex flex-col items-center gap-2",
                    isDragging ? "border-primary bg-primary/10" : "border-muted-foreground/25 hover:border-primary",
                    isImporting && "opacity-50 pointer-events-none"
                )}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
            >
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    accept=".xlsx,.xls,.ods,.csv,.json"
                    className="hidden"
                />

                {isImporting ? (
                    <>
                        <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">Processando arquivo...</p>
                    </>
                ) : (
                    <>
                        <div className="bg-muted p-2 rounded-full">
                            <Upload className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm font-medium">Toque para selecionar ou arraste o arquivo</p>
                            <p className="text-xs text-muted-foreground">XLSX, CSV (Planilha) ou JSON (Backup)</p>
                        </div>
                    </>
                )}
            </div>

            {error && (
                <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
                    {error}
                </div>
            )}

            <div className="flex justify-between gap-2">
                <Button variant="ghost" onClick={downloadTemplate} disabled={isImporting} className="gap-2">
                    <Download className="h-4 w-4" /> Modelo
                </Button>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={onClose} disabled={isImporting}>
                        Cancelar
                    </Button>
                </div>
            </div>
        </div>
    )
}
