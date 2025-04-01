import { writeFile } from "fs/promises"
import { join } from "path"
import {convertToCSV} from "@/lib/csv-export.ts";

/**
 * Função de servidor para exportar dados para CSV
 * Útil para conjuntos de dados grandes que podem ser melhor processados no servidor
 */
export async function exportLeadsToCSV(leads: any[]) {
    try {
        // Preparar dados para exportação
        const exportData = leads.map((lead) => ({
            ID: lead.id,
            Nome: lead.name,
            Telefone: lead.phoneNumber,
            Agendado: lead.scheduled ? "Yes" : "No",
            "Data de Contato": new Date(lead.callDate).toLocaleString("pt-BR"),
        }))

        // Converter para CSV
        const csvData = convertToCSV(exportData)

        // Gerar nome do arquivo com data atual
        const date = new Date()
        const formattedDate = date.toISOString().split("T")[0] // YYYY-MM-DD
        const filename = `leads_${formattedDate}.csv`

        // Caminho para salvar o arquivo (ajuste conforme necessário)
        const filePath = join(process.cwd(), "public", "exports", filename)

        // Salvar o arquivo
        await writeFile(filePath, csvData)

        // Retornar o caminho relativo para download
        return `/exports/${filename}`
    } catch (error) {
        console.error("Erro ao exportar CSV no servidor:", error)
        throw new Error("Falha ao exportar dados para CSV")
    }
}

