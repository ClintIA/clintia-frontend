/* eslint-disable @typescript-eslint/no-explicit-any */
import React, {useCallback, useEffect, useState} from 'react'
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
import { validarTelefone} from "@/lib/utils.ts";
import { getPatientByPhoneAndTenant} from "@/services/patientService.tsx";
import {ModalType} from "@/types/ModalType.ts";
import {Spinner} from "@/components/ui/Spinner.tsx";
import {genderOptions} from "@/lib/optionsFixed.ts";
import {isAxiosError} from "axios";
import {DadosBooking} from "@/components/AdminBooking/RegisterBooking.tsx";
import {listCanalMarketing} from "@/services/marketingService.ts";
import {toast} from "@/hooks/use-toast.ts";
import {IMarketing} from "@/types/Marketing.ts";

export interface Exams {
    id: number
    exam_name: string
    price: string
    createdAt: Date
}
interface Doctor {
    id: number
    fullName: string
    exams: any[]
}
export interface BookingWithPatient {
    patientData: DadosPaciente,
    examId: number
    userId: number
    doctorId: number,
    examDate?: string
}
interface BookingModalProps {
    handleModalMessage?: (type: ModalType) => void
    submitBooking?: (bookingDados: DadosBooking, tenantId: number,patientData: DadosPaciente) => Promise<any>
    setStep: (step: number) => void
    submitBookingWithPatient?: (data: BookingWithPatient, tenant: number) => Promise<any>
    title: string
}

const RegisterBookingAndPatient: React.FC<BookingModalProps> = ({title,handleModalMessage, submitBooking, submitBookingWithPatient, setStep }: BookingModalProps) => {
    const [dadosBooking, setDadosBooking] = useState<DadosBooking>({} as DadosBooking);
    const [canal, setCanal] = useState<IMarketing[]>([])
    const [selectedExame, setSelectedExame] = useState<string>('')
    const [selectedDoctor, setSelectedDoctor] = useState<string>('')
    const [exames, setExames] = useState<Exams[]>([])
    const [phone, setPhone] = useState<string>('')
    const [erro, setErro] = useState<string | null>(null)
    const [doctors, setDoctors] = useState<Doctor[] | undefined>(undefined)
    const [loading, setLoading] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [notFoundPhone, setNotFoundPhone] = useState<boolean>(false)
    const [showForm, setShowForm] = useState<boolean>(false)
    const [patientData, setPatientData] = useState<DadosPaciente>()
    const [selectedCanal, setSelectedCanal] = useState<string | undefined>('')
    const [isNewPatient, setIsNewPatient] = useState<boolean>(false)
    const auth = useAuth()
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setPatientData(prev => ({ ...prev, [name]: value }))
    }

    const clearCpf = () => {
        setPatientData({
            full_name: '',
            email: '',
            phone: '',
            dob: '',
            cpf: '',
            diagnostic: '',
            canal:'',
            cep:'',
            gender: '',
            health_card_number: '',
        })
        setNotFoundPhone(false)
        setShowForm(false)
        setPhone('')
        setStep(0)
    }
    const fetchCanal = useCallback(async () => {
        if (auth.tenantId) {
            const result = await listCanalMarketing(auth.tenantId)

            if (result.data) {
                setCanal(result.data.data)
            }

        }
    }, [auth.tenantId])
    useEffect(   () => {
        fetchCanal().then()
    }, [fetchCanal]);

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
                    setIsLoading(true)
                    const exam = exames.find((exam) => exam.id === parseInt(selectedExame))
                    if(exam) {
                        const result = await listDoctorByExam(auth.tenantId,exam.exam_name)
                        if(result?.data.status === "success") {
                            if(result?.data.data.length === 0) {
                                setDoctors(undefined)
                                setIsLoading(false)
                                return
                            } else {
                                setDoctors(result?.data.data)
                                setErro(null)
                            }
                        }
                    }
                    setIsLoading(false)
                }

            } catch (error) {
                setErro("Não possível carregar os profissionais")
                console.error(error)
            }
        }
        fetchDoctors().then()
    }, [exames, selectedExame, auth.tenantId]);


    const handleInputCpf = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPhone(e.target.value)
    }

    const handlePhoneCheck = async (e: React.FormEvent) => {
        e.preventDefault()
        setErro(null)
        const checkPhone = validarTelefone(phone)
        if (!checkPhone) {
            setErro('Por favor, insira um Telefone')
            return
        }
         if (!checkPhone) {
            setErro('CPF Inválido')
            return
        }
        const numericPhone = phone.replace(/\D/g, '')
        try {
            if(auth.tenantId) {
                const result = await getPatientByPhoneAndTenant(numericPhone, auth.tenantId)

                if(result?.message?.includes("não encontrado")) {
                   setStep(1)
                    setIsNewPatient(true)
                    setShowForm(true)
                    setNotFoundPhone(true)
                    return
                }
                const data = result?.data.data
                if(!data) {
                    setErro('Cadastro não encontrado, realizar o cadastro do paciente')
                    return
                } else {
                    setSelectedCanal(data.canal)
                    setPatientData(data)
                    setShowForm(true)
                    setNotFoundPhone(true)
                    setStep(2)
                }
            }
        } catch (error) {
            setErro('Falha ao verificar o CPF. Por favor, tente novamente.' + error)
        }
    }
    const handleInputBookingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setDadosBooking(prev => ({ ...prev, [name]: value }))
    }
   const handleSubmit = async (e: React.FormEvent) => {
       e.preventDefault()
       if(!dadosBooking.examDate) {
           return
       }

       setErro(null)
       dadosBooking.examId = parseInt(selectedExame)
       dadosBooking.patientId = patientData?.id;
       dadosBooking.userId = auth.userId;
       dadosBooking.doctorId = parseInt(selectedDoctor)

       if (!dadosBooking.examDate ||
           !dadosBooking.examId) {
           setErro('Por favor, preencha todos os campos')
           return
       }
       const createDate = (date?: string) => {
           if(date) {
               const dateArray = date.split('-')
               return dateArray[0] + "-" + dateArray[1] + "-" + dateArray[2]
           }
       }
       const doctorSelected = doctors?.find(e => e.id === dadosBooking.doctorId);
       try {
           if (auth.tenantId && auth.userId) {
               if(isNewPatient && submitBookingWithPatient) {
                   if(patientData) {
                       patientData.phone = phone
                       patientData.canal = selectedCanal

                       const bookingWithPatient: BookingWithPatient = {
                           patientData: {...patientData, dob: createDate(patientData.dob)},
                           examId: parseInt(selectedExame),
                           userId: auth.userId,
                           doctorId: parseInt(selectedDoctor),
                           examDate: createDate(dadosBooking.examDate),

                       }
                      await submitBookingWithPatient(bookingWithPatient, auth.tenantId)
                          .then(() => setStep(3))
                           .catch((error) =>  {
                               if(isAxiosError(error)) {
                                   setErro('Erro ao Cadastrar Paciente')
                               }
                               console.log(error)
                           })
                       return
                   }
               }
               const bookingDados = {
                   ...dadosBooking,
                   examDate: createDate(dadosBooking.examDate),
                   doctor: doctorSelected
               }
               try {
                   if (submitBooking && patientData) {
                       patientData.phone = phone
                       patientData.canal = selectedCanal

                       const result = await submitBooking(bookingDados,auth.tenantId, patientData)
                       if(result.status !== 201) {
                           setErro('Erro ao salvar paciente, verifique os dados')
                           toast({
                               title:'Clintia',
                               description: 'Erro ao salvar paciente, verifique os dados'
                           })

                       }
                       if(result.status === 201 && handleModalMessage) {
                           handleModalMessage(ModalType.bookingConfirmation)
                           setStep(3)
                       }
                   }
               } catch (error) {
                   console.error(error)
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
                    <CardTitle className='text-xl text-oxfordBlue'>{title}</CardTitle>
                    <CardDescription>
                        Preencha os detalhes do paciente abaixo. Clique em salvar para continuar.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit}>
                        <div className="grid gap-4">
                            <div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="cpf" className="text-right text-oxfordBlue">
                                        Telefone
                                    </Label>
                                    <Input
                                        id="phone"
                                        name="phone"
                                        placeholder="22999999999"
                                        value={phone}
                                        onChange={handleInputCpf}
                                        className="col-span-3"
                                       disabled={notFoundPhone}
                                    />
                                </div>
                                {showForm ? (
                                    <div className="flex justify-end mt-1">
                                        <Button className="bg-oxfordBlue text-white"
                                                onClick={clearCpf}>Limpar</Button>
                                    </div>
                                ) : (
                                    <div className="flex justify-end mt-1">
                                        <Button className="bg-oxfordBlue text-white"
                                                onClick={handlePhoneCheck}>Verificar</Button>
                                    </div>
                                )
                                }
                            </div>
                            <div className={showForm ? 'grid gap-2' : 'hidden'}>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="full_name" className="text-right text-oxfordBlue">
                                        Nome
                                    </Label>
                                    <Input
                                        id="full_name"
                                        name="full_name"
                                        value={patientData?.full_name}
                                        className="col-span-3"
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="phone" className="text-right text-oxfordBlue">
                                        CPF
                                    </Label>
                                    <Input
                                        id="cpf"
                                        name="cpf"
                                        value={patientData?.cpf}
                                        onChange={handleInputChange}
                                        className="col-span-3"
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="email" className="text-right text-oxfordBlue">
                                        Email
                                    </Label>
                                    <Input
                                        id="email"
                                        name="email"
                                        value={patientData?.email}
                                        className="col-span-3"
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="health_card_number" className="text-right text-oxfordBlue">
                                        Plano de Saúde
                                    </Label>
                                    <Input
                                        id="health_card_number"
                                        name="health_card_number"
                                        type="tel"
                                        onChange={handleInputChange}
                                        value={patientData?.health_card_number}
                                        className="col-span-3"
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="dob" className="text-right text-oxfordBlue">
                                        Data de Nascimento
                                    </Label>
                                    <Input
                                        id="dob"
                                        name="dob"
                                        type="date"
                                        value={patientData?.dob}
                                        onChange={handleInputChange}
                                        className="col-span-3"
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="cep" className="text-right text-oxfordBlue">
                                        CEP
                                    </Label>
                                    <Input
                                        id="cep"
                                        name="cep"
                                        type="text"
                                        value={patientData?.cep}
                                        onChange={handleInputChange}
                                        className="col-span-3"
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="cep" className="text-right text-oxfordBlue">
                                        Diagnóstico
                                    </Label>
                                    <Input
                                        id="diagnostic"
                                        name="diagnostic"
                                        type="text"
                                        value={patientData?.diagnostic}
                                        onChange={handleInputChange}
                                        className="col-span-3 h-16"
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="gender" className="text-right text-oxfordBlue">
                                        Genero
                                    </Label>
                                    <div className="flex flex-row gap-2">
                                        {genderOptions.map((option) => (

                                            <label
                                                key={option.value}
                                                className="flex items-center space-x-3 cursor-pointer"
                                            >
                                                <input
                                                    type="radio"
                                                    name="gender"
                                                    value={option.value}
                                                    checked={patientData?.gender === option.value}
                                                    onChange={handleInputChange}
                                                    className="form-radio h-4 w-4 text-oxfordBlue focus:ring-blue-800 border-gray-300"
                                                />
                                                <span
                                                    className="w-max text-sm text-oxfordBlue">{option.label}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label className="text-right text-oxfordBlue" htmlFor="examId">Selecione o
                                        Canal de Captação</Label>
                                    <Select value={selectedCanal} onValueChange={setSelectedCanal}>
                                        <SelectTrigger className="col-span-3" id="canal">
                                            <SelectValue placeholder="Selecione o Canal de Captação"/>
                                        </SelectTrigger>
                                        <SelectContent>
                                            {canal.map((canal) => (
                                                <SelectItem key={canal.id} value={canal.id ? canal.id.toString() : ''}>
                                                    {canal.canal}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label className="text-right text-oxfordBlue" htmlFor="examId">Selecione o Exame</Label>
                                <Select disabled={!patientData} value={selectedExame} onValueChange={setSelectedExame}>
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
                            <Label htmlFor="doctor" className="text-right text-oxfordBlue">
                                Selecione o Profissional
                            </Label>
                            {isLoading  ? (
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Spinner size={16} className="text-muted-foreground" />
                                </div>
                            ) : (
                                <Select disabled={!patientData} value={selectedDoctor} onValueChange={setSelectedDoctor}>
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
                            )}
                        </div>

                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="examDate" className="text-right text-oxfordBlue00">
                                    Dia do Exame
                                </Label>
                                <Input
                                    id="examDate"
                                    name="examDate"
                                    type="datetime-local"
                                    onChange={handleInputBookingChange}
                                    className="col-span-3"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end mt-6">
                            <Button className="bg-oxfordBlue text-white" type="submit">Salvar Agendamento</Button>
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

export default RegisterBookingAndPatient;