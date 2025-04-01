import React, {useCallback, useEffect, useState} from 'react'
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card.tsx"
import {Tabs, TabsContent} from "@/components/ui/tabs.tsx"
import {DadosPaciente} from "@/components/AdminPatient/RegisterPatient.tsx";
import {Button} from "@/components/ui/button.tsx";
import ModalRender from "@/components/ModalHandle/ModalRender.tsx";
import {confirmPatientExam, deletePatientExam, listPatientExams} from "@/services/patientExamService.tsx";
import {useAuth} from "@/hooks/auth.tsx";
import {IPatientExam} from "@/pages/admin/AdminHome.tsx";
import BookingList from "@/components/AdminBooking/BookingList.tsx";
import {Input} from "@/components/ui/input.tsx";
import { formatDate} from "@/lib/utils.ts";
import GeneralModal from "@/components/ModalHandle/GeneralModal.tsx";
import {ModalType} from "@/types/ModalType.ts";
import Cards from "@/components/Card.tsx";
import NoDataTable from "@/components/NoDataTable.tsx";

const AdminBooking: React.FC = () =>  {

    const [openModalNewPatient, setOpenModalNewPatient] = useState<boolean>(false)
    const [type,setType] = useState<ModalType>(ModalType.newPatient)
    const [exams, setExams] = useState<IPatientExam[]>([])
    const [title, setTitle] = useState<string>("")
    const [date, setDate] = useState(new Date().toISOString().split('T')[0])
    const [dadosPaciente, setDadosPaciente] = useState<DadosPaciente>({
        full_name: '',
        email: '',
        phone: '',
        dob: '',
        cpf: '',
        canal:'',
        cep:'',
        gender: '',
        health_card_number: '',
    })
    const [loading, setLoading] = useState<boolean>(false)
    const [titleModal,setTitleModal] = useState("");
    const [action,setAction] = useState("");
    const [isError, setIsError] = useState(false);
    const [generalMessage, setGeneralMessage] = useState<string>('')
    const [isGeneralModalOpen, setIsGeneralModalOpen] = useState(false)
    const auth = useAuth()
    const openFlexiveModal = (title: string, modalType: ModalType, paciente?: DadosPaciente) => {
        if(paciente) {
            setDadosPaciente(paciente)
        }
        setType(modalType)
        setTitle(title)
        setOpenModalNewPatient(true)
    }


    const fetchPatientExams = useCallback(async (newDate: string) => {
        try {
            if (auth.tenantId) {
                setLoading(true)
                const result = await listPatientExams(auth.tenantId, {
                    startDate: newDate,
                    endDate: newDate,
                    status: 'Scheduled'
                })
                setLoading(false)
                if (result?.data?.status === "success") {
                    const examsList = result?.data?.data?.exams as IPatientExam[]
                    setExams(examsList || [])
                }
            }
        } catch (error) {
            setLoading(false)
            console.error(error)
        }
    }, [auth.tenantId])
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target
        setDate(value)
    }
    useEffect(() => {

        fetchPatientExams(date).then()
    }, [date, fetchPatientExams]);
    const handleConfirmationBooking = () => {
        openFlexiveModal('Confirmação de Agendamento', ModalType.bookingConfirmation)
    }
    const handleModalMessage = (message: string) => {
        setGeneralMessage(message)
        setTitleModal('Confirmação')
        setAction('Fechar')
        setIsError(false)
        setIsGeneralModalOpen(true)
    }
    const handleClose = () => {
        fetchPatientExams(date).then()
        setOpenModalNewPatient(false)
    }
    const handlePresence  = async (examId: number, presence: null | 'Yes' | 'No') => {
        try {
            if(auth.tenantId) {
                const result = await confirmPatientExam(auth.tenantId, examId, presence)
                if(result) {
                    if(presence === 'No') {
                        handleModalMessage('Paciente Cancelado')
                    } else if(presence === 'Yes') {
                        handleModalMessage('Paciente Confirmado')
                    } else {
                        handleModalMessage('Paciente Não Compareceu')
                    }
                    fetchPatientExams(date).then()
                }
            }
        } catch(error) {
            console.log(error)
        }
    }

    const handleDeleteBooking = async (patientExamId: number) => {
        try {
            await deletePatientExam(auth.tenantId!, patientExamId);
            handleModalMessage('Agendamento deletado com sucesso.')
            await fetchPatientExams(date)
        } catch (error) {
            console.error(error)
            handleModalMessage('Erro ao deletar o agendamento.')
        }
    }

    return (
        <div className="w-full p-10 mx-auto">
            <h1 className="text-3xl mb-6 font-bold tracking-tight">Agendamentos</h1>
            <div className="flex flex-col md:flex-row gap-3 mb-6">
                <Cards name='Total de Agendamentos' content={exams?.length}/>
            </div>

                    <div>
                        <Tabs defaultValue="lista" className="space-y-4">
                        <TabsContent value="lista">
                            <Card className="p-10">
                                <CardTitle className="ml-8 text-oxfordBlue text-xl">
                                    {`Agendamentos do dia: ${formatDate(date.split('T')[0])}`}
                                </CardTitle>
                                <CardHeader
                                    className="flex flex-col sm:flex-row gap-2 justify-between text-base text-oxfordBlue">
                                    <div className="mt-1.5 flex gap-2">
                                        <Button
                                            onClick={() => openFlexiveModal('Agendamento de Procedimento', ModalType.newBookingPatient)}
                                            className="bg-oxfordBlue text-white hover:bg-blue-900" type="submit">Realizar
                                            Agendamento
                                        </Button>
                                    </div>
                                    <div>
                                        <Input
                                            id="examDate"
                                            name="examDate"
                                            type="date"
                                            value={new Date(date).toISOString().split('T')[0]}
                                            className="col-span-3 w-48 h-10 font-semibold text-base text-oxfordBlue"
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                </CardHeader>
                                {
                                    exams.length === 0 ?
                                        (
                                            <div>
                                                <NoDataTable message="Não possui agendamentos para o dia de hoje"/>
                                            </div>
                                        ) : (
                                            <CardContent>
                                                <div className="ml-4">
                                                    <BookingList
                                                        onConfirmarPresenca={handlePresence}
                                                        onDeleteBooking={handleDeleteBooking}
                                                        loading={loading}
                                                        agendamentos={exams}
                                                    />
                                                </div>
                                            </CardContent>
                                        )
                                }
                            </Card>
                        </TabsContent>
                    </Tabs>
                    </div>

            {openModalNewPatient && <ModalRender
                isOpen={openModalNewPatient}
                title={title}
                type={type}
                isStepper={true}
                data={dadosPaciente}
                onClose={handleClose}
                modalMessage={handleModalMessage}
                modalNewBookingConfirmation={handleConfirmationBooking}
            />}
            <GeneralModal
                title={titleModal}
                action={action}
                error={isError}
                isOpen={isGeneralModalOpen}
                onClose={() => setIsGeneralModalOpen(false)}
                message={generalMessage}/>
        </div>
    )
}

export default AdminBooking;