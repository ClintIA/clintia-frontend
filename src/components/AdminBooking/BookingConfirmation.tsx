import React from 'react'
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card.tsx";
import {Button} from "@/components/ui/button.tsx";
import {Exams} from "@/components/AdminBooking/RegisterBooking.tsx";
import {CalendarDays, Clock, FileText, User} from "lucide-react";
import {ModalType} from "@/types/ModalType.ts";

export interface BookingConfirmationProps {
    exame?: Exams,
    dadosBooking: BookingConfirmationState,
    onNewBooking?: (type: ModalType) => void
    setStep: (step: number) => void

}
export interface BookingConfirmationState {
    exam_name?: string
    exameDate?: string
    doctor?: string
    patientName?: string
    patientPhone?: string
}
const BookingConfirmation: React.FC<BookingConfirmationProps> = ({ dadosBooking, onNewBooking, setStep}: BookingConfirmationProps) => {


    const newBooking = () => {
        if (onNewBooking) {
            onNewBooking(ModalType.newBookingPatient);
            setStep(0)
        }
    }
    const createDate = (date: string) => {
        const dateArray = date.split('-')
        return dateArray[2] + "/" + dateArray[1] + "/" + dateArray[0]
    }
     return (
        <div className="mt-6">
            <Card className="w-full max-w-2xl mx-auto">
                <CardHeader>
                    <CardTitle className='text-xl text-oxfordBlue'>Agendamento concluído</CardTitle>
                    <CardDescription>
                        Confira os dados do agendamento:
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4">
                        <div className="flex items-center">
                            <User className="mr-2 h-4 w-4 opacity-70"/>
                            <span className="font-semibold">Paciente:</span>
                            <span className="ml-2">{dadosBooking?.patientName}</span>
                        </div>
                        <div className="flex items-center">
                            <User className="mr-2 h-4 w-4 opacity-70"/>
                            <span className="font-semibold">Profissional:</span>
                            <span className="ml-2">{dadosBooking.doctor? dadosBooking.doctor : 'Profissional não informado'}</span>
                        </div>
                        <div className="flex items-center">
                            <CalendarDays className="mr-2 h-4 w-4 opacity-70"/>
                            <span className="font-semibold">Data:</span>
                            <span className="ml-2">{dadosBooking.exameDate? createDate(dadosBooking.exameDate.split('T')[0]) : ''}</span>
                        </div>
                        <div className="flex items-center">
                            <Clock className="mr-2 h-4 w-4 opacity-70"/>
                            <span className="font-semibold">Hora:</span>
                            <span className="ml-2">{dadosBooking.exameDate ? new Date(dadosBooking.exameDate).toISOString().substring(11, 16) : ''}</span>
                        </div>
                        <div className="flex items-center">
                            <FileText className="mr-2 h-4 w-4 opacity-70"/>
                            <span className="font-semibold">Tipo de Exame:</span>
                            <span className="ml-2">{dadosBooking?.exam_name}</span>
                        </div>
                    </div>
                </CardContent>
                <CardFooter>
                    <div className="flex flex-row gap-2">
                        <Button onClick={newBooking} className="bg-skyBlue text-white">
                            Finalizar agendamento
                        </Button>
                    </div>

                </CardFooter>

            </Card>

        </div>
    )
}

export default BookingConfirmation;