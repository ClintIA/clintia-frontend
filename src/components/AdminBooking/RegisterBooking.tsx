/* eslint-disable @typescript-eslint/no-explicit-any */
import React, {useEffect, useState} from 'react'
import {Button} from "@/components/ui/button.tsx"
import {Input} from "@/components/ui/input.tsx"
import {Label} from "@/components/ui/label.tsx"
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle,} from "@/components/ui/card.tsx"
import {AlertCircle} from "lucide-react"
import {Alert, AlertDescription, AlertTitle} from "@/components/ui/alert.tsx"
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select.tsx"
import {DadosPaciente} from "@/components/AdminPatient/RegisterPatient.tsx";
import {listDoctorByExam, listTenantExam} from "@/services/tenantExamService.tsx";
import {useAuth} from "@/hooks/auth.tsx";
import Loading from "@/components/Loading.tsx";
import {ModalType} from "@/types/ModalType.ts";

export interface DadosBooking {
    patientId: number | undefined
    examId: number | undefined
    examDate: string | undefined
    doctorId: number | undefined
    userId: number | undefined
    doctor?: Doctor
}
interface BookingModalProps {
    dadosPaciente?: DadosPaciente
    isNewBooking?: (bookingDados: DadosBooking, tenant: number) => Promise<any>
    onClose?: () => void
    title: string
    handleModalMessage?: (type: ModalType) => void
    setStep: (step: number) => void

}
export interface Exams {
    id: number
    exam_name: string
    price: string
    exam_type?: string
    doctorPrice?: number
    doctors?: Doctor[]
    createdAt: Date
}
interface Doctor {
    id: number
    fullName: string
    exams?: any[]
}

const RegisterBooking: React.FC<BookingModalProps> = ({title,dadosPaciente, isNewBooking, handleModalMessage,setStep}: BookingModalProps ) => {
    const [dadosBooking, setDadosBooking] = useState<DadosBooking>({} as DadosBooking);
    const [selectedExame, setSelectedExame] = useState<string>('')
    const [selectedDoctor, setSelectedDoctor] = useState<string>('')
    const [exames, setExames] = useState<Exams[]>([])
    const [erro, setErro] = useState<string | null>(null)
    const [doctors, setDoctors] = useState<Doctor[] | undefined>(undefined)
    const [loading, setLoading] = useState<boolean>(false);
    const auth = useAuth()

    useEffect( () => {
        const fetchExams = async () => {
            try {
                if(auth.tenantId) {
                    setLoading(true)

                    const result = await listTenantExam(auth.tenantId)
                    if(result?.data.data.length === 0 ) {
                      setErro('Não possui procedimentos cadastrados')
                        setLoading(false)
                        return
                    }
                    if(result?.data.status === "success") {
                        setExames(result?.data.data)
                        setErro(null)
                        setLoading(false)

                    }
                }
            } catch (error) {
                setErro("Não possível carregar os procedimentos")
                console.error(error)
            }
        }
        fetchExams().then()
    }, [auth.tenantId]);
    useEffect( () => {
        const fetchDoctors = async () => {
            try {
                if(auth.tenantId && selectedExame) {
                    setLoading(true)
                    const exam = exames.find((exam) => exam.id === parseInt(selectedExame))
                    if(exam) {
                        const result = await listDoctorByExam(auth.tenantId,exam.exam_name)
                        if(result?.data.status === "success") {
                            if(result?.data.data.length === 0) {
                                setDoctors(undefined)
                                setErro('Não possui profissional cadastrado para esse exame')
                                setLoading(false)

                                return
                            } else {
                                setDoctors(result?.data.data)
                                setErro(null)
                            }
                        }
                    }
                    setLoading(false)

                }

            } catch (error) {
                setErro("Não possível carregar os profissionais")
                console.error(error)
            }
        }
        fetchDoctors().then()
    }, [exames, selectedExame, auth.tenantId]);


    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setDadosBooking(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setErro(null)
        if(!dadosPaciente?.id) {
            setErro('ID do Paciente não encontrado')
        }
        dadosBooking.examId = parseInt(selectedExame)
        dadosBooking.patientId = dadosPaciente?.id;
        dadosBooking.userId = auth.userId;
        dadosBooking.doctorId = parseInt(selectedDoctor)
        if (!dadosBooking.examDate ||
            !dadosBooking.examId) {
            setErro('Por favor, preencha todos os campos')
            return
        }
        const createDate = (date: string) => {
            const dateArray = date.split('-')
            return dateArray[0] + "-" + dateArray[1] + "-" + dateArray[2]
        }

        try {
            if(auth.tenantId) {
                const bookingDados = { ...dadosBooking, examDate: createDate(dadosBooking.examDate) }
                if(isNewBooking) {
                    try {
                        const result = await isNewBooking(bookingDados, auth.tenantId)
                            if(result.status === 201 && handleModalMessage) {
                                handleModalMessage(ModalType.bookingConfirmation)
                                setStep(3)
                            }
                    } catch (error) {
                        console.error(error)
                    }

                }
                setDadosBooking({
                    examDate: '',
                    patientId: undefined,
                    examId: undefined,
                    doctorId: undefined,
                    userId: undefined,
                })
            }
        } catch (error) {
            setErro('Falha ao cadastrar paciente. Por favor, tente novamente.')
            console.log(error)
        }
    }
    if (loading) {
        return <Loading />
    }


    return (
        <div className="mt-6">

            <Card className="w-full max-w-2xl mx-auto">
                <CardHeader>
                    <CardTitle className='text-xl text-oxfordBlue00'>{title}</CardTitle>
                    <CardDescription>
                        Preencha os detalhes do paciente abaixo. Clique em salvar para continuar.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit}>
                        <div className="grid gap-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="full_name" className="text-right text-oxfordBlue00">
                                    Nome
                                </Label>
                                <Input
                                    id="full_name"
                                    name="full_name"
                                    value={dadosPaciente?.full_name}
                                    className="col-span-3"
                                    disabled={true}
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="phone" className="text-right text-oxfordBlue00">
                                    Contato
                                </Label>
                                <Input
                                    id="phone"
                                    name="phone"
                                    type="tel"
                                    value={dadosPaciente?.phone}
                                    className="col-span-3"
                                    disabled={true}
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label className="text-right text-oxfordBlue00" htmlFor="examId">Selecione o Exame</Label>
                                <Select value={selectedExame} onValueChange={setSelectedExame}>
                                    <SelectTrigger className="col-span-3" id="examId">
                                        <SelectValue placeholder="Selecione o Exame"/>
                                    </SelectTrigger>
                                    <SelectContent>
                                        {exames.map((exam) => (
                                            <SelectItem key={exam.id} value={exam.id.toString()}>
                                                {exam.exam_name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="doctor" className="text-right text-oxfordBlue00">
                                    Selecione o Profissional
                                </Label>
                                <Select disabled={!doctors} value={selectedDoctor} onValueChange={setSelectedDoctor}>
                                    <SelectTrigger className="col-span-3" id="doctor">
                                        <SelectValue placeholder="Selecione o Profissional"/>
                                    </SelectTrigger>
                                    <SelectContent>
                                        {doctors?.map((doctor) => (
                                            <SelectItem key={doctor.id} value={doctor.id.toString()}>
                                                {doctor.fullName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="examDate" className="text-right text-oxfordBlue00">
                                    Dia do Exame
                                </Label>
                                <Input
                                    id="examDate"
                                    name="examDate"
                                    type="datetime-local"
                                    onChange={handleInputChange}
                                    className="col-span-3"
                                />
                            </div>

                        </div>
                        <div className="flex justify-end mt-6">
                            <Button className="bg-skyBlue text-white" type="submit">Salvar Agendamento</Button>
                        </div>
                    </form>
                </CardContent>
                <CardFooter>
                    {erro && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4"/>
                            <AlertTitle>Erro</AlertTitle>
                            <AlertDescription>{erro}</AlertDescription>
                        </Alert>
                    )}
                </CardFooter>
            </Card>

        </div>

    )
}

export default RegisterBooking;