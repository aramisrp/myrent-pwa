import { utils, write, read } from "xlsx";

// 1. Setup mock data
const mockData = [
    {
        "Região Administrativa": "Lago Sul",
        "ENDEREÇO": "SHIS QI 05 Conjunto 10",
        "TIPO": "Casa",
        "QTD QUARTOS": 4,
        "QTD BANHEIROS": 5,
        "área total MT²": 400,
        "VARANDA": "Sim",
        "LAZER": "Piscina e Churrasqueira",
        "ACESSIBILIDADE": "Não",
        "METRÔ": "Não",
        "ALUGUEL": 12000,
        "CONDOMÍNIO": 0,
        "TOTAL MENSAL": 12000,
        "IPTU RESIDENCIAL": 3000,
        "CONTATO": "Imobiliária X"
    },
    {
        "Região Administrativa": "Águas Claras",
        "ENDEREÇO": "Rua 36 Norte",
        "TIPO": "Apartamento",
        "QTD QUARTOS": 2,
        "QTD BANHEIROS": 2,
        "área total MT²": 60,
        "VARANDA": "Sim",
        "LAZER": "Completo",
        "ACESSIBILIDADE": "Sim",
        "METRÔ": "Sim",
        "ALUGUEL": 2500,
        "CONDOMÍNIO": 500,
        "TOTAL MENSAL": 3000,
        "IPTU RESIDENCIAL": 100,
        "CONTATO": "Proprietário"
    }
];

// 2. Create workbook and write to buffer
const worksheet = utils.json_to_sheet(mockData);
const workbook = utils.book_new();
utils.book_append_sheet(workbook, worksheet, "Sheet1");
const buffer = write(workbook, { type: "buffer", bookType: "xlsx" });

console.log("Mock XLSX generated. Buffer size:", buffer.length);

// 3. Read back and parse (Logic from PropertyImport.jsx)
// Simulating reading from file.arrayBuffer()
const wbRead = read(buffer, { type: 'array' });
const firstSheetName = wbRead.SheetNames[0];
const wsRead = wbRead.Sheets[firstSheetName];
const jsonData = utils.sheet_to_json(wsRead);

console.log("Rows read:", jsonData.length);

const importedProperties = jsonData.map(row => {
    const region = row["Região Administrativa"] || ""
    const address = row["ENDEREÇO"] || ""
    const type = row["TIPO"] || ""
    const bedrooms = row["QTD QUARTOS"] ? `${row["QTD QUARTOS"]} quartos` : ""
    const bathrooms = row["QTD BANHEIROS"] ? `${row["QTD BANHEIROS"]} banheiros` : ""
    const area = row["área total MT²"] ? `${row["área total MT²"]}m²` : ""
    const balcony = row["VARANDA"] === "Sim" ? "Varanda" : ""
    const leisure = row["LAZER"] || ""
    const accessibility = row["ACESSIBILIDADE"] || ""
    const metro = row["METRÔ"] || ""
    const contact = row["CONTATO"] || ""

    const rent = Number(row["ALUGUEL"]) || 0
    const condo = Number(row["CONDOMÍNIO"]) || 0
    const iptu = Number(row["IPTU RESIDENCIAL"]) || 0
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
        area ? `Área: ${area}` : null,
        leisure ? `Lazer: ${leisure}` : null,
        contact ? `Contato: ${contact}` : null,
        region ? `Região: ${region}` : null
    ].filter(Boolean).join("\n")

    return {
        title: `${type} em ${region || address}`.trim() || "Imóvel Importado",
        address: address,
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

console.log("Values parsed:");
console.log(JSON.stringify(importedProperties, null, 2));

if (importedProperties.length !== 2) {
    console.error("FAILED: Expected 2 properties");
    process.exit(1);
}

if (importedProperties[0].total_cost !== 15000) { // 12000 + 0 + 3000
    console.error("FAILED: Calculation error. Expected 15000, got", importedProperties[0].total_cost);
    process.exit(1);
}

console.log("SUCCESS: Parsing logic is correct.");
