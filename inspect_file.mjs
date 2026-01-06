import { readFileSync } from "fs";
import { read, utils } from "xlsx";

try {
    const buffer = readFileSync("Pesquisa.xlsx");
    const workbook = read(buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = utils.sheet_to_json(sheet, { header: 1 });

    console.log("Headers detected:");
    console.log(JSON.stringify(data[0], null, 2));

    console.log("\nFirst row sample:");
    console.log(JSON.stringify(data[1], null, 2));
} catch (error) {
    console.error("Error reading file:", error);
}
