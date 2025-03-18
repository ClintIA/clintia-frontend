/* eslint-disable @typescript-eslint/no-explicit-any */
import React, {useCallback, useEffect, useState} from 'react'
import {Button} from "@/components/ui/button.tsx"
import {Input} from "@/components/ui/input.tsx"
import {Label} from "@/components/ui/label.tsx"
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle,} from "@/components/ui/card.tsx"
import {AlertCircle} from "lucide-react"
import {Alert, AlertDescription, AlertTitle} from "@/components/ui/alert.tsx"
import {useAuth} from "@/hooks/auth.tsx";
import {CreateLeadDTO} from "@/types/dto/CreateLead.ts";
import {toast} from "@/hooks/use-toast.ts";
import {createRegisterLead, updateLead} from "@/services/leadService.tsx";
import {LoadingBar} from "@/components/LoadingBar.tsx";
import {ExamesSelect} from "@/components/AdminBooking/RegisterBookingAndPatient.tsx";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select.tsx";
import {listDoctorByExam, listTenantExam} from "@/services/tenantExamService.tsx";
import {Doctor} from "@/pages/admin/AdminTenantExams.tsx";
import {Spinner} from "@/components/ui/Spinner.tsx";
import {listCanalMarketing} from "@/services/marketingService.ts";
import {IMarketing} from "@/types/Marketing.ts";
import {contactChannel} from "@/lib/optionsFixed.ts";
import {useNavigate} from "react-router-dom";



interface LeadRegisterProps {
    newLead?: (pacienteDados: CreateLeadDTO, tenant: number) => Promise<any>
    title: string
    leadInfo?: CreateLeadDTO
}

const AdminLead: React.FC<LeadRegisterProps> = ({leadInfo}: LeadRegisterProps) => {

    const [leadRegister, setLeadRegister] = useState<CreateLeadDTO>({} as CreateLeadDTO)
    const [erro, setErro] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [selectedExame, setSelectedExame] = useState<string>('')
    const [selectedDoctor, setSelectedDoctor] = useState<string>('')
    const [doctors, setDoctors] = useState<Doctor[] | undefined>(undefined)
    const [canal, setCanal] = useState<IMarketing[]>([])
    const [selectedChannelContact, setSelectedChannelContact] = useState<string | undefined>('')
    const [selectedCanal, setSelectedCanal] = useState<string>('')
    const [exames, setExames] = useState<ExamesSelect[]>([])

    const auth = useAuth()
    const navigate = useNavigate()
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setLeadRegister(prev => ({ ...prev, [name]: value }))
    }
    useEffect( () => {
        const fetchExams = async () => {
            try {
                if(auth.tenantId) {
                    const result = await listTenantExam(auth.tenantId)
                    if(result?.data.data.length === 0 ) {
                        setErro('Não possui procedimentos cadastrados')
                        return
                    }
                    if(result?.data.status === "success") {
                        setExames(result?.data.data)
                        setErro(null)
                        if(leadInfo) {
                            setSelectedExame(leadInfo.exam?.id?.toString() || '')
                        }

                    }
                }
            } catch (error) {
                setErro("Não possível carregar os procedimentos")
                console.error(error)
            }
        }
        fetchExams().then()
    }, [auth.tenantId]);
    useEffect(() => {
        if(leadInfo) {
            setLeadRegister(prevDados => ({
                ...prevDados,
                ...leadInfo
            }))
            setSelectedCanal(leadInfo.canal || '')
            setSelectedChannelContact(leadInfo.contactChannel)
        }
    }, [leadInfo])
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
                                if(leadInfo) {
                                    setSelectedDoctor(leadInfo.scheduledDoctor?.id?.toString() || '')
                                }
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
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setErro(null)

        try {
            if (auth.tenantId) {
                setIsLoading(true)

                const response = await createRegisterLead({...leadRegister,
                    phoneNumber: leadRegister.phoneNumber?.replace(/\D/g, ''),
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
    const handleUpdateLead = async (e: React.FormEvent) => {
        e.preventDefault()
        setErro(null)
        try {
            if (auth.tenantId) {
                setIsLoading(true)

                const response = await updateLead({...leadRegister,
                    phoneNumber: leadRegister.phoneNumber?.replace(/\D/g, ''),
                    scheduledDoctorId: parseInt(selectedDoctor) || undefined,
                    examId: parseInt(selectedExame) || undefined,
                    canal: selectedCanal,
                    contactChannel: selectedChannelContact
                }, leadInfo?.id)
                if (response.status === 200) {
                    toast({
                        title: 'Sucesso!',
                        description: 'Atualizado registrado com sucesso.',
                    });
                    setTimeout(() => {
                       window.location.reload()
                    },2000);
                } else {
                    setErro("Erro ao atualizar Lead")
                }
            }
        } catch (error) {
            console.error(error);
            setErro('Falha ao atualizar lead.');
        } finally {
            setIsLoading(false)

        }
    }

    return (
        <div className="mt-6">
            <Card className="w-full max-w-2xl mx-auto">
                <CardHeader>
                    <CardTitle className='text-oxfordBlue text-xl'>Registro de Lead</CardTitle>
                    <CardDescription>
                        Preencha os dados abaixo. Clique em salvar quando terminar.
                    </CardDescription>
                    <hr />
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

                        <div className="grid grid-cols-2 gap-4">
                            <div className=" col-span-2 space-y-2">
                                <Label htmlFor="name" className="text-right text-oxfordBlue">
                                    Nome
                                </Label>
                                <Input
                                    id="name"
                                    name="name"
                                    value={leadRegister.name}
                                    onChange={handleInputChange}
                                    className="col-span-3"/>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phoneNumber" className="text-right text-oxfordBlue">
                                    Telefone
                                </Label>
                                <Input
                                    id="phoneNumber"
                                    name="phoneNumber"
                                    type="tel"
                                    placeholder='22999999999'
                                    value={leadRegister.phoneNumber}
                                    onChange={handleInputChange}
                                    className="col-span-3"/>
                            </div>
                            <div className=" space-y-2">
                                <Label htmlFor="contactChannel" className="text-oxfordBlue">
                                    Canal de Contato
                                </Label>
                                <Select value={selectedChannelContact} onValueChange={setSelectedChannelContact}>
                                    <SelectTrigger  id="contactChannel">
                                        <SelectValue placeholder="Canal de Contato"/>
                                    </SelectTrigger>
                                    <SelectContent >
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
                                            <SelectItem key={c.id?.toString()} value={c.id ? c.id.toString() : ""}>
                                                {c.canal}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            {canal.map((item) => {
                                    if ((parseInt(selectedCanal) == item.id) && (item.canal == "Indicação" || item.canal == "Outros")) {
                                        return (
                                            <div className="space-y-2">
                                                <Label htmlFor="indication_name" className="text-oxfordBlue">
                                                    Nome da Indicação/Outros
                                                </Label>
                                                <Input id="cep" name="indication_name" type="text"
                                                       value={leadRegister?.indication_name}
                                                       onChange={handleInputChange}/>
                                            </div>
                                        )
                                    }
                                }
                            )}
                            <div className="col-span-2 space-y-2">
                                <Label htmlFor="diagnosis" className="text-right text-oxfordBlue">
                                    Diagnóstico
                                </Label>
                                <Input
                                    id="diagnosis"
                                    name="diagnosis"
                                    type="text"
                                    value={leadRegister.diagnosis}
                                    onChange={handleInputChange}
                                    className="col-span-3 h-12"/>
                            </div>
                            <div className=" space-y-2">
                                <Label htmlFor="examId" className="text-oxfordBlue">
                                    Exame
                                </Label>
                                <Select value={selectedExame}
                                        onValueChange={setSelectedExame}>
                                    <SelectTrigger id="examId">
                                        <SelectValue placeholder="Selecione o Exame"/>
                                    </SelectTrigger>
                                    <SelectContent>
                                        {exames?.map((exam) => (
                                            <SelectItem key={exam.id.toString()} value={exam.id.toString()}>
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
                                    <Select disabled={!doctors} value={selectedDoctor}
                                            onValueChange={setSelectedDoctor}>
                                        <SelectTrigger id="doctor">
                                            <SelectValue placeholder="Selecione o Profissional"/>
                                        </SelectTrigger>
                                        <SelectContent>
                                            {doctors?.map((doctor) => (
                                                <SelectItem key={doctor.id.toString()} value={doctor.id.toString()}>
                                                    {doctor.fullName}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="obs" className="text-right text-oxfordBlue">
                                    Data do agendamento
                                </Label>
                                <Input
                                    id="scheduledDate"
                                    name="scheduledDate"
                                    type="date"
                                    value={leadRegister.scheduledDate}
                                    onChange={handleInputChange}
                                    className="col-span-3"/>
                            </div>
                        </div>
                        <div className="flex justify-end mt-6">
                            {(!leadInfo) && (<Button className="bg-oxfordBlue text-white" type="submit">Registrar Lead</Button>)}
                            {(leadInfo) && (<Button className="bg-oxfordBlue text-white" onClick={handleUpdateLead}>Atualizar
                                Lead</Button>)}
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
export default AdminLead;