import React from 'react'
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table"
import {IPatientExam} from "@/pages/admin/AdminHome.tsx";
import Loading from "@/components/Loading.tsx";
import AppointmentConfirmation from "@/components/ConfirmButtons.tsx";
import { Button } from "@/components/ui/button"
import { Trash2 } from 'lucide-react';

interface ListaAgendamentosProps {
    agendamentos: IPatientExam[]
    onConfirmarPresenca?: (id: number, presence: null | 'Yes' | 'No') => void
    onDeleteBooking?: (id: number) => void
    loading: boolean
}

const BookingList: React.FC<ListaAgendamentosProps> = ({ agendamentos ,loading, onConfirmarPresenca, onDeleteBooking }: ListaAgendamentosProps) => {
    if(loading) {
        return (<Loading />)
    }
    if(agendamentos.length === 0) {
        return (<p className="text-base font-semibold">Não possuí procedimentos para o dia selecionado</p>)
    }

    const handleConfirmarPresenca = (id: number, presence: null | 'Yes' | 'No') => {
        if (onConfirmarPresenca) {
            onConfirmarPresenca(id,presence);
        }
    }
    const handlePresence = (attended: null | 'Yes' | 'No') => {
        switch(attended) {
            case null:
                return 'Aguardando'
            case 'Yes':
                return 'Confirmado'
            case 'No':
                return 'Não Compareceu'
        }
    }

    const handleDelete = (id: number) => {
        if (onDeleteBooking) {
            onDeleteBooking(id)
        }
    }

     return (
             <Table>
                 <TableHeader>
                     <TableRow>
                         <TableHead>Paciente</TableHead>
                         <TableHead>Hora</TableHead>
                         <TableHead>Procedimento</TableHead>
                         <TableHead>Profissional</TableHead>
                         <TableHead>Status</TableHead>
                         <TableHead>Ação</TableHead>
                         <TableHead>Excluir</TableHead>
                     </TableRow>
                 </TableHeader>
                 <TableBody>
                     {agendamentos?.map((agendamento) => (
                         <TableRow key={agendamento?.id}>
                             <TableCell>{agendamento?.patient?.full_name}</TableCell>
                             <TableCell>{new Date(agendamento?.examDate).toISOString().substring(11, 16)}</TableCell>
                             <TableCell>{agendamento?.exam.exam_name}</TableCell>
                             <TableCell>{agendamento?.doctor?.fullName}</TableCell>
                             <TableCell>
                                 <span className={agendamento.attended == null ? `text-oxfordBlue font-semibold` : agendamento.attended ? `text-green-700 font-semibold` : `text-red-600 font-semibold`}>{handlePresence(agendamento.attended)}</span>
                             </TableCell>
                             <TableCell>
                                 <AppointmentConfirmation onCancel={() => handleConfirmarPresenca(agendamento?.id, null)} onConfirm={() => handleConfirmarPresenca(agendamento?.id, 'Yes')} onDecline={() => handleConfirmarPresenca(agendamento?.id, 'No')} status={handlePresence(agendamento.attended)} />
                             </TableCell>
                             <TableCell>
                                 <Button variant="ghost" onClick={() => handleDelete(agendamento.id)}>
                                     <Trash2 className="h-5 w-5 text-red-500" />
                                 </Button>
                             </TableCell>
                         </TableRow>
                     ))}
                 </TableBody>
             </Table>
     )
}

export default BookingList;