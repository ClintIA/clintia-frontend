
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
import {getPatientByPhoneAndTenant, updatePatient} from "@/services/patientService.tsx";
import {ModalType} from "@/types/ModalType.ts";
import {Spinner} from "@/components/ui/Spinner.tsx";
import {contactChannel, genderOptions} from "@/lib/optionsFixed.ts";
import {DadosBooking} from "@/components/AdminBooking/RegisterBooking.tsx";
import {listCanalMarketing} from "@/services/marketingService.ts";
import {toast} from "@/hooks/use-toast.ts";
import {IMarketing} from "@/types/Marketing.ts";
import {LoadingBar} from "@/components/LoadingBar.tsx";
import {registerBookingWithPatient, registerPatientExam} from "@/services/patientExamService.tsx";
import {BookingConfirmationState} from "@/components/AdminBooking/BookingConfirmation.tsx";
import {CreateLeadDTO} from "@/types/dto/CreateLead.ts";
import {createRegisterLead} from "@/services/leadService.tsx";
import {useNavigate} from "react-router-dom";

export interface ExamesSelect {
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
    doctorId?: number,
    examDate?: string
}
interface BookingModalProps {
    handleModalMessage?: (type: ModalType, patientData?: BookingConfirmationState, data?: DadosPaciente) => void
    setStep: (step: number) => void
    title: string
}

const RegisterBookingAndPatient: React.FC<BookingModalProps> = ({title,handleModalMessage, setStep }: BookingModalProps) => {
    const [dadosBooking, setDadosBooking] = useState<DadosBooking>({} as DadosBooking);
    const [canal, setCanal] = useState<IMarketing[]>([])
    const [selectedExame, setSelectedExame] = useState<string>('')
    const [selectedDoctor, setSelectedDoctor] = useState<string>('')
    const [exames, setExames] = useState<ExamesSelect[]>([])
    const [phone, setPhone] = useState<string>('')
    const [erro, setErro] = useState<string | null>(null)
    const [doctors, setDoctors] = useState<Doctor[] | undefined>(undefined)
    const [loading, setLoading] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [notFoundPhone, setNotFoundPhone] = useState<boolean>(false)
    const [showForm, setShowForm] = useState<boolean>(false)
    const [patientData, setPatientData] = useState<DadosPaciente>()
    const [selectedCanal, setSelectedCanal] = useState<string | undefined>('')
    const [selectedChannelContact, setSelectedChannelContact] = useState<string | undefined>('')
    const [isNewPatient, setIsNewPatient] = useState<boolean>(false)
    const auth = useAuth()
    const navigate = useNavigate();
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
            contactChannel: '',
            indication_name: ''
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
                        return
                    }
                    if(result?.data.status === "success") {
                        setExames(result?.data.data)
                        setErro(null)

                    }
                }
            } catch (error) {
                setErro("Não possível carregar os procedimentos")
                console.error(error)
            } finally {
                setLoading(false)
            }
        }
        fetchExams().then()
    }, [auth.tenantId]);
    useEffect( () => {
        const fetchDoctors = async () => {
            try {
                if(auth.tenantId && selectedExame) {
                    const exam = exames.find((exam) => exam.id === parseInt(selectedExame))
                    if(exam) {
                        setIsLoading(true)
                        const result = await listDoctorByExam(auth.tenantId,exam.exam_name)
                        if(result?.data.status === "success") {
                            if(result?.data.data.length === 0) {
                                setDoctors(undefined)
                                return
                            } else {
                                setDoctors(result?.data.data)
                                setErro(null)
                            }
                        }
                    }
                }
            } catch (error) {
                setErro("Não possível carregar os profissionais")
                console.error(error)
            } finally {
                setIsLoading(false)
            }
        }
        fetchDoctors().then()
    }, [exames, selectedExame, auth.tenantId]);
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
                setIsLoading(true)
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
                    setSelectedChannelContact(data.contactChannel)
                    setPatientData(data)
                    setShowForm(true)
                    setNotFoundPhone(true)
                    setStep(2)
                }
            }
        } catch (error) {
            setErro('Falha ao verificar o CPF. Por favor, tente novamente.' + error)
        } finally {
            setIsLoading(false)
        }
    }
    const handleInputBookingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setDadosBooking(prev => ({ ...prev, [name]: value }))
    }
    const submitBookingExam = async (bookingDados: DadosBooking, tenantId: number | undefined, patientData?: DadosPaciente) => {
        try {
                if(patientData) {
                   const result = await updatePatient(patientData, tenantId)
                    if(!result) {
                        setErro('Erro ao atualizar dados do paciente')
                    }
                }
              return  await registerPatientExam(bookingDados, tenantId)

        } catch (error) {
            console.log(error)
        }
    }
    const submitBookintWithPatient = async (bookingDataWithPatient: BookingWithPatient, tenantId: number) => {
        try {
          return await registerBookingWithPatient(bookingDataWithPatient, tenantId)

        } catch (error) {
            console.log(error)
        }
    }
    const handleSubmitLead = async (e: React.FormEvent) => {
        e.preventDefault()
        setErro(null)

        try {
            if (auth.tenantId) {
                setIsLoading(true)

                const response = await createRegisterLead({...patientData,
                    phoneNumber: patientData?.phone?.replace(/\D/g, ''),
                    scheduledDoctorId: parseInt(selectedDoctor) || undefined,
                    examId: parseInt(selectedExame) || undefined,
                    canal: selectedCanal || undefined,
                    contactChannel: selectedChannelContact
                }, auth.tenantId)
                if (response.status === 201) {
                    toast({
                        title: 'Sucesso!',
                        description: 'Contato registrado com sucesso.',
                    });
                    setTimeout(() => {
                        navigate('/admin/leads')
                    },3000);
                } else {
                    setErro("Erro ao registrar Lead")
                }
            }
        } catch (error) {
            console.error(error);
            setErro('Falha ao registrar o contato.');
        } finally {
            setIsLoading(false)

        }
    }
    const handleSubmit = async (e: React.FormEvent) => {
       e.preventDefault()
       if(!dadosBooking.examDate) {
           setErro('Por favor, Selecione a data do agendamento')
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

           if (auth.tenantId && auth.userId && patientData) {

               const bookingDados = {
                   ...dadosBooking,
                   examDate: createDate(dadosBooking.examDate),
                   doctor: doctorSelected,
                   doctorId: parseInt(selectedDoctor) || undefined
               }
               const createLead: CreateLeadDTO = {
                   name: patientData.full_name,
                   phoneNumber: patientData.phone?.replace(/\D/g, '') || undefined,
                   canal: patientData.canal || undefined,
                   indication_name: patientData.indication_name || undefined,
                   contactChannel: patientData.contactChannel || undefined,
                   diagnosis: patientData.diagnostic || undefined,
                   scheduled: !!bookingDados.examDate,
                   scheduledDate: bookingDados.examDate || undefined,
                   scheduledDoctorId: bookingDados.doctorId || undefined,
                   examId: bookingDados.examId || undefined,
               }

               setIsLoading(true)
               await createRegisterLead(createLead, auth.tenantId)
               if (isNewPatient) {
                   if (patientData) {
                       patientData.phone = phone
                       patientData.canal = selectedCanal
                       patientData.contactChannel = selectedChannelContact

                       const bookingWithPatient: BookingWithPatient = {
                           patientData: {...patientData, dob: createDate(patientData.dob)},
                           examId: parseInt(selectedExame),
                           userId: auth.userId,
                           doctorId: parseInt(selectedDoctor) || undefined,
                           examDate: createDate(dadosBooking.examDate),

                       }
                       try {
                           const result = await submitBookintWithPatient(bookingWithPatient, auth.tenantId)
                           if (result.status === 201 && handleModalMessage) {
                               handleModalMessage(ModalType.bookingConfirmation, result?.data.data.data)
                               setStep(3)
                           }
                           return
                       } catch (error) {
                           setErro('Erro ao cadastrar novo paciente' + error)
                       }
                   }
               }

               if (patientData) {
                   patientData.phone = phone
                   patientData.canal = selectedCanal
                   patientData.contactChannel = selectedChannelContact
                   try {
                       const result = await submitBookingExam(bookingDados, auth.tenantId, patientData)
                       if (result.status !== 201) {
                           setErro('Erro ao salvar paciente, verifique os dados')
                           toast({
                               title: 'Clintia',
                               description: 'Erro ao salvar paciente, verifique os dados'
                           })
                       }

                       if (result.status === 201 && handleModalMessage) {
                           handleModalMessage(ModalType.bookingConfirmation, result?.data.data.data)
                           setStep(3)
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
             }
           }

           if (loading) {
               return <Loading />
           }

       return (
           <div className="w-full mx-auto mt-10">
               <Card className="w-full">
                   <CardHeader>
                       <CardTitle className="text-xl text-oxfordBlue">{title}</CardTitle>
                       <CardDescription>Preencha os detalhes do paciente abaixo. Clique em salvar para
                           continuar.</CardDescription>
                       {isLoading && (<div className="space-y-2">
                           <LoadingBar
                               progress={undefined}
                               height={8}
                               color="#051E32"
                               className="mb-8"
                               indeterminate={isLoading}
                           />
                       </div>)}
                   </CardHeader>
                   <CardContent>
                       <form onSubmit={handleSubmit}>
                           <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                               <div className="col-span-4 space-y-2">
                                   <Label htmlFor="phone" className="text-oxfordBlue">
                                       Telefone
                                   </Label>
                                   <div className="flex items-center gap-2">
                                       <Input
                                           id="phone"
                                           name="phone"
                                           placeholder="Telefone com DDD"
                                           value={phone}
                                           onChange={(e) => setPhone(e.target.value)}
                                           disabled={notFoundPhone}
                                           className="flex-grow"
                                       />
                                       {showForm ? (
                                           <Button className="bg-oxfordBlue text-white" onClick={clearCpf}>
                                               Limpar
                                           </Button>
                                       ) : (
                                           <Button className="bg-oxfordBlue text-white" onClick={handlePhoneCheck}>
                                               Verificar
                                           </Button>
                                       )}
                                   </div>
                               </div>

                               {showForm && (
                                   <>
                                       <div className="col-span-2 space-y-2">
                                           <Label htmlFor="full_name" className="text-oxfordBlue">
                                               Nome
                                           </Label>
                                           <Input
                                               id="full_name"
                                               name="full_name"
                                               value={patientData?.full_name}
                                               onChange={handleInputChange}
                                           />
                                       </div>
                                       <div className="col-span-2 space-y-2">
                                           <Label htmlFor="cpf" className="text-oxfordBlue">
                                               CPF
                                           </Label>
                                           <Input id="cpf" name="cpf" value={patientData?.cpf}
                                                  onChange={handleInputChange}/>
                                       </div>
                                       <div className="space-y-2">
                                           <Label htmlFor="email" className="text-oxfordBlue">
                                               Email
                                           </Label>
                                           <Input id="email" name="email" value={patientData?.email}
                                                  onChange={handleInputChange}/>
                                       </div>
                                       <div className="space-y-2">
                                           <Label htmlFor="health_card_number" className="text-oxfordBlue">
                                               Plano de Saúde
                                           </Label>
                                           <Input
                                                id="health_card_number"
                                               name="health_card_number"
                                               type="tel"
                                               value={patientData?.health_card_number}
                                               onChange={handleInputChange}
                                           />
                                       </div>
                                       <div className="space-y-2">
                                           <Label htmlFor="dob" className="text-oxfordBlue">
                                               Data de Nascimento
                                           </Label>
                                           <Input id="dob" name="dob" type="date" value={patientData?.dob}
                                                  onChange={handleInputChange}/>
                                       </div>
                                       <div className="space-y-2">
                                           <Label htmlFor="cep" className="text-oxfordBlue">
                                               CEP
                                           </Label>
                                           <Input id="cep" name="cep" type="text" value={patientData?.cep}
                                                  onChange={handleInputChange}/>
                                       </div>
                                       <div className=" space-y-2">
                                           <Label htmlFor="contactChannel" className="text-oxfordBlue">
                                               Canal de Contato
                                           </Label>
                                           <Select value={selectedChannelContact} onValueChange={setSelectedChannelContact}>
                                               <SelectTrigger id="contactChannel">
                                                   <SelectValue placeholder="Canal de Contato"/>
                                               </SelectTrigger>
                                               <SelectContent>
                                                   {contactChannel.map((c) => (
                                                       <SelectItem key={c.value} value={c.value}>
                                                           {c.label}
                                                       </SelectItem>
                                                   ))}
                                               </SelectContent>
                                           </Select>
                                       </div>
                                       <div className=" space-y-2">
                                           <Label htmlFor="canal" className="text-oxfordBlue">
                                               Canal de Captação
                                           </Label>
                                           <Select value={selectedCanal} onValueChange={setSelectedCanal}>
                                               <SelectTrigger id="canal">
                                                   <SelectValue placeholder="Canal de Captação"/>
                                               </SelectTrigger>
                                               <SelectContent>
                                                   {canal.map((c) => (
                                                       <SelectItem key={c.id} value={c.id ? c.id.toString() : ""}>
                                                           {c.canal}
                                                       </SelectItem>
                                                   ))}
                                               </SelectContent>
                                           </Select>
                                       </div>
                                       {canal.map((item) => {
                                               if ((selectedCanal == item.id) && (item.canal == "Indicação" || item.canal == "Outros")) {
                                                   return (
                                                       <div className="space-y-2">
                                                           <Label htmlFor="indication_name" className="text-oxfordBlue">
                                                               Nome
                                                           </Label>
                                                           <Input id="cep" name="indication_name" type="text" value={patientData?.indication_name}
                                                                  onChange={handleInputChange}/>
                                                       </div>
                                                   )
                                               }
                                           }
                                       )}
                                       <div className="col-span-4 space-y-2">
                                           <Label htmlFor="gender" className="text-oxfordBlue">
                                               Gênero
                                           </Label>
                                           <div className="flex flex-row gap-4">
                                               {genderOptions.map((option) => (
                                                   <label key={option.value}
                                                          className="flex items-center space-x-2 cursor-pointer">
                                                       <input
                                                           type="radio"
                                                           name="gender"
                                                           value={option.value}
                                                           checked={patientData?.gender === option.value}
                                                           onChange={handleInputChange}
                                                           className="form-radio h-4 w-4 text-oxfordBlue focus:ring-blue-800 border-gray-300"
                                                       />
                                                       <span className="text-sm text-oxfordBlue">{option.label}</span>
                                                   </label>
                                               ))}
                                           </div>
                                       </div>
                                       <div className="col-span-4 space-y-2">
                                           <Label htmlFor="diagnostic" className="text-oxfordBlue">
                                               Diagnóstico
                                           </Label>
                                           <Input
                                               id="diagnostic"
                                               name="diagnostic"
                                               type="text"
                                               value={patientData?.diagnostic}
                                               onChange={handleInputChange}
                                               className="h-16"
                                           />
                                       </div>
                                       <div className=" space-y-2">
                                           <Label htmlFor="examId" className="text-oxfordBlue">
                                               Exame
                                           </Label>
                                           <Select disabled={!patientData} value={selectedExame}
                                                   onValueChange={setSelectedExame}>
                                               <SelectTrigger id="examId">
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
                                       <div className=" space-y-2">
                                           <Label htmlFor="doctor" className="text-oxfordBlue">
                                               Profissional
                                           </Label>
                                           {isLoading ? (
                                               <div className="flex items-center justify-center h-10">
                                                   <Spinner size={16} className="text-muted-foreground"/>
                                               </div>
                                           ) : (
                                               <Select disabled={!patientData} value={selectedDoctor}
                                                       onValueChange={setSelectedDoctor}>
                                                   <SelectTrigger id="doctor">
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
                                       <div className=" space-y-2">
                                           <Label htmlFor="examDate" className="text-oxfordBlue">
                                               Dia do Exame
                                           </Label>
                                           <Input id="examDate" name="examDate" type="datetime-local"
                                                  onChange={handleInputBookingChange}/>
                                       </div>
                                   </>
                               )}
                           </div>
                           { showForm && (<div className="flex justify-between mt-8 gap-4">
                               <Button className="bg-oxfordBlue text-white w-70" type="button"
                                       onClick={handleSubmitLead}>
                                   Registrar Contato
                               </Button>
                               <Button disabled={!selectedExame} className="bg-oxfordBlue text-white w-70" type="submit">
                                   Salvar Agendamento
                               </Button>
                           </div>)}
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