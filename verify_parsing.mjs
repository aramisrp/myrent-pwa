import { readFileSync } from "fs";
import { read, utils } from "xlsx";

try {
    const buffer = readFileSync("Pesquisa.xlsx");
    const workbook = read(buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    // LOGIC FROM PropertyImport.jsx

    // Get data as array of arrays to find header row
    const rawDataArray = utils.sheet_to_json(sheet, { header: 1 })

    // Find header row (row containing "ENDEREÇO" or "ALUGUEL")
    let headerRowIndex = 0
    for (let i = 0; i < rawDataArray.length; i++) {
        const row = rawDataArray[i]
        if (row.some(cell => typeof cell === 'string' && (cell.toUpperCase().includes("ENDEREÇO") || cell.toUpperCase().includes("ALUGUEL")))) {
            headerRowIndex = i
            break
        }
    }

    console.log("Header row found at index:", headerRowIndex);

    // Parse again starting from header row
    const jsonData = utils.sheet_to_json(sheet, { range: headerRowIndex })

    if (jsonData.length === 0) {
        throw new Error("O arquivo parece estar vazio.")
    }

    // Normalize keys to allow case-insensitive matching
    const normalizeKey = (key) => key.trim().toLowerCase()

    const importedProperties = jsonData.map(row => {
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
            if (keyContent === "área total MT²") {
                if (normalizedRow["mt²"] !== undefined) return normalizedRow["mt²"]
                if (normalizedRow["area total mt²"] !== undefined) return normalizedRow["area total mt²"]
            }

            return undefined
        }

        const region = getValue("Região Administrativa") || ""
        const address = getValue("ENDEREÇO") || ""
        const type = getValue("TIPO") || ""
        const residential = getValue("RESIDENCIAL") || ""
        const iptu = Number(getValue("IPTU")) || 0

        // Debug output for first item
        return {
            region, address, type, residential, iptu,
            found_MT2: getValue("área total MT²")
        }
    })

    console.log("Parsed", importedProperties.length, "properties.");
    console.log("First item:", JSON.stringify(importedProperties[0], null, 2));

} catch (error) {
    console.error("Error reading file:", error);
}
