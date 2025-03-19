export const genderOptions = [
    { value: 'Masculino', label: 'Masculino' },
    { value: 'Feminino', label: 'Feminino' },
    { value: 'Prefiro não informar', label: 'Prefiro não identificar' },
    { value: 'Outros', label: 'Outros' }
];
export const examOptions = [
    { value: 'exame', label: 'Procedimento' },
    { value: 'consulta', label: 'Consulta' },
];
export const roleOptions = [
    { value: 'admin', label: 'Admin', disable: false},
    { value: 'marketing', label: 'Marketing', disable: false },
    { value: 'default', label: 'Atendente', disable: false },
    { value: 'doctor', label: 'Profissional da Saúde', disable: true },
    { value: 'patient', label: 'Paciente', disable: true }
];
export const contactChannel = [
    { value: 'whatsapp', label: 'WhatsApp', disable: false},
    { value: 'phone', label: 'Telefone', disable: false },
];
export const months = [
    { value: "1", label: "Janeiro" },
    { value: "2", label: "Fevereiro" },
    { value: "3", label: "Março" },
    { value: "4", label: "Abril" },
    { value: "5", label: "Maio" },
    { value: "6", label: "Junho" },
    { value: "7", label: "Julho" },
    { value: "8", label: "Agosto" },
    { value: "9", label: "Setembro" },
    { value: "10", label: "Outubro" },
    { value: "11", label: "Novembro" },
    { value: "12", label: "Dezembro" },
]
const currentYear = new Date().getFullYear()
export const years = Array.from({ length: 6 }, (_, i) => currentYear - 5 + i)

export const days = Array.from({ length: 31 }, (_, i) => i + 1)
export const findRoleOptions = (canal?: string) => {
    if(canal) {
        let role;
        roleOptions.find((option) => {
            if(option.value == canal) {
                role = option.label;
            }
        })
        return role
    }
}

export const steps = ['Cadastro', 'Agendamento','Finalizado']
