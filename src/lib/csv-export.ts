/**
 * Converte um array de objetos para formato CSV
 * @param data Array de objetos a serem convertidos
 * @param headers Cabeçalhos personalizados (opcional)
 * @returns String no formato CSV
 */
export function convertToCSV<T extends Record<string, any>>(data: T[], headers?: { [K in keyof T]?: string }) {
    if (data.length === 0) {
        return ""
    }

    // Obter as chaves do primeiro objeto para usar como cabeçalhos padrão
    const keys = Object.keys(data[0]) as Array<keyof T>

    // Criar linha de cabeçalho
    const headerRow = keys
        .map((key) => {
            // Usar cabeçalho personalizado se fornecido, caso contrário usar a chave
            return headers && headers[key] ? headers[key] : String(key)
        })
        .join(",")

    // Criar linhas de dados
    const csvRows = data.map((item) => {
        return keys
            .map((key) => {
                // Obter o valor e formatá-lo adequadamente
                let value: any = item[key]

                // Formatar datas
                if (value instanceof Date) {
                    value = value.toLocaleString("pt-BR")
                }

                // Converter para string e escapar aspas
                const stringValue = String(value)

                // Se o valor contiver vírgulas, aspas ou quebras de linha, envolva em aspas
                if (stringValue.includes(",") || stringValue.includes('"') || stringValue.includes("\n")) {
                    return `"${stringValue.replace(/"/g, '""')}"`
                }

                return stringValue
            })
            .join(",")
    })

    // Juntar cabeçalho e linhas
    return [headerRow, ...csvRows].join("\n")
}

/**
 * Cria e inicia o download de um arquivo CSV
 * @param data Dados CSV em formato string
 * @param filename Nome do arquivo a ser baixado
 */
export function downloadCSV(data: string, filename: string) {
    // Criar um blob com os dados CSV
    const blob = new Blob([data], { type: "text/csv;charset=utf-8;" })

    // Criar URL para o blob
    const url = URL.createObjectURL(blob)

    // Criar elemento de link para download
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", filename)
    link.style.display = "none"

    // Adicionar o link ao documento, clicar nele e removê-lo
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    // Liberar a URL do objeto
    URL.revokeObjectURL(url)
}

