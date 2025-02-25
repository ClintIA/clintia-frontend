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
