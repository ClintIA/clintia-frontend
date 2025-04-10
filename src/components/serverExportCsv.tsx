import * as XLSX from "xlsx"

/**
 * Função de servidor para exportar dados para CSV
 * Útil para conjuntos de dados grandes que podem ser melhor processados no servidor
 */
export async function exportLeadsToCSV(data: any[]) {
    try {

            const workbook = XLSX.utils.book_new()

            const worksheet = XLSX.utils.json_to_sheet(data)

            XLSX.utils.book_append_sheet(workbook, worksheet, "Employees")

        const date = new Date()
        const formattedDate = date.toISOString().split("T")[0] // YYYY-MM-DD
        const filename = `RELATORIO_LEADS_${formattedDate}.xlsx`

        // Caminho para salvar o arquivo (ajuste conforme necessário)

        // Salvar o arquivo
        XLSX.writeFile(workbook, filename)

        // Retornar o caminho relativo para download
        return `/exports/${filename}`
        // Retornar o caminho relativo para download
    } catch (error) {
        console.error("Erro ao exportar XLSX no servidor:", error)
        throw new Error("Falha ao exportar dados para XLSX")
    }
}

