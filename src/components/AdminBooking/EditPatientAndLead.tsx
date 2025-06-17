import React, { useCallback, useEffect, useState } from 'react'
import { Button } from "@/components/ui/button.tsx"
import { Input } from "@/components/ui/input.tsx"
import { Label } from "@/components/ui/label.tsx"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card.tsx"
import { AlertCircle, CircleAlert } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert.tsx"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select.tsx"
import { listDoctorByExam, listTenantExam } from "@/services/tenantExamService.tsx"
import { useAuth } from "@/hooks/auth.tsx"
import { Spinner } from "@/components/ui/Spinner.tsx"
import { contactChannel } from "@/lib/optionsFixed.ts"
import { listCanalMarketing } from "@/services/marketingService.ts"
import { toast } from "@/hooks/use-toast.ts"
import { IMarketing } from "@/types/Marketing.ts"
import { LoadingBar } from "@/components/LoadingBar.tsx"
import { CreateLeadDTO } from "@/types/dto/CreateLead.ts"
import {updateLead} from "@/services/leadService.tsx";
import {ExamesSelect} from "@/components/AdminBooking/RegisterBookingAndPatient.tsx";
import {Doctor} from "@/pages/admin/AdminTenantExams.tsx";

interface EditPatientModalProps {
    title: string
    dadosIniciais?: CreateLeadDTO
}

const EditPatientAndLead: React.FC<EditPatientModalProps> = ({
                                                                 title,
                                                                 dadosIniciais
                                                             }: EditPatientModalProps) => {
    const [leadData, setLeadData] = useState<CreateLeadDTO>()
    const [canal, setCanal] = useState<IMarketing[]>([])
    const [selectedExame, setSelectedExame] = useState<string>('')
    const [selectedDoctor, setSelectedDoctor] = useState<string>('')
    const [erro, setErro] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [selectedCanal, setSelectedCanal] = useState<string | undefined>()
    const [selectedChannelContact, setSelectedChannelContact] = useState<string | undefined>()
    const [scheduledDate, setScheduledDate] = useState<string>('')
    const [exames, setExames] = useState<ExamesSelect[]>([])
    const [doctors, setDoctors] = useState<Doctor[] | undefined>(undefined)

    const auth = useAuth()

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setLeadData(prev => ({ ...prev, [name]: value }))
    }

    const fetchCanal = useCallback(async () => {
        if (auth.tenantId) {
            const result = await listCanalMarketing(auth.tenantId)
            if (result.data) {
                setCanal(result.data.data)
            }
        }
    }, [])
    useEffect( () => {
        const fetchExams = async () => {
            try {
                if(auth.tenantId) {
                    setIsLoading(true)
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
                setIsLoading(false)
            }
        }
        fetchExams().then()
    }, [auth.tenantId,dadosIniciais])

    useEffect( () => {
        const fetchDoctors = async () => {
            try {
                if(auth.tenantId) {
                    if (dadosIniciais?.exam?.id) {
                        setSelectedExame(String(dadosIniciais.exam.id))
                    }
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
                                if (dadosIniciais?.scheduledDoctor?.id) {
                                    setSelectedDoctor(String(dadosIniciais.scheduledDoctor.id))
                                }
                                setErro(null)
                            }
                        }
                    }
                }
            } catch (error) {
                setErro("Não possível carregar os profissionais: " + error)
            } finally {
                setIsLoading(false)
            }

        }

        fetchDoctors().then()
    }, [exames, selectedExame, auth.tenantId,dadosIniciais]);
    useEffect(() => {
        fetchCanal().then()
        if (dadosIniciais?.canal) {
            setSelectedCanal(dadosIniciais.canal)
        }
    }, [fetchCanal])
    useEffect(() => {
        if(dadosIniciais) {
            setLeadData(prevDados => ({
                ...prevDados,
                ...dadosIniciais
            }))
            setSelectedChannelContact(dadosIniciais.contactChannel)
            if (dadosIniciais.scheduledDate) {
                setScheduledDate(dadosIniciais?.scheduledDate?.toString().slice(0, 16))
            }
        }
    }, [dadosIniciais])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setErro(null)

        if (!leadData?.name || !leadData?.phoneNumber || !selectedCanal || !selectedChannelContact) {
            setErro('Por favor, preencha todos os campos obrigatórios: Nome, Telefone, Canal de Contato e Canal de Captação')
            return
        }

        try {
            setIsLoading(true)
            // Update lead data if leadId is provided
            if (auth.tenantId) {
                const createDate = (date?: string) => {
                    if (date) {
                        const dateArray = date.split('-')
                        return dateArray[0] + "-" + dateArray[1] + "-" + dateArray[2]
                    }
                }
                const leadUpdateData: CreateLeadDTO = {
                    ...leadData,
                    canal: selectedCanal || undefined,
                    contactChannel: selectedChannelContact || undefined,
                    scheduled: !!scheduledDate,
                    scheduledDate: createDate(scheduledDate) || undefined,
                    scheduledDoctorId: selectedDoctor ? parseInt(selectedDoctor) : undefined,
                    examId: selectedExame ? parseInt(selectedExame) : undefined,
                    diagnosis: leadData.diagnosis || undefined,
                    indication_name: leadData.indication_name || undefined
                }
                console.log(leadData)

                const leadResponse = await updateLead(leadUpdateData, auth.tenantId)
                if (!leadResponse || leadResponse.status !== 200) {
                    setErro('Erro ao atualizar dados do lead')
                    return
                }
            }

            toast({
                title: 'Sucesso!',
                description: 'Dados atualizados com sucesso.',
            })
            window.location.reload()
        } catch (error) {
            setErro('Falha ao atualizar os dados: ' + error)
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="w-full mx-auto mt-10">
            <Card>
                {erro && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4"/>
                        <AlertTitle>Erro</AlertTitle>
                        <AlertDescription>{erro}</AlertDescription>
                    </Alert>
                )}
            </Card>
            <Card className="w-full">
                <CardHeader>
                    <CardTitle className="text-xl text-oxfordBlue">{title}</CardTitle>
                    <CardDescription>Edite os detalhes do paciente/lead abaixo. Clique em salvar para
                        continuar.</CardDescription>
                    {isLoading && (<div className="space-y-2">
                        <LoadingBar
                            progress={undefined}
                            height={8}
                            color="#051E32"
                            className="mb-8"
                            indeterminate={true}
                        />
                    </div>)}
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="col-span-2 space-y-2">
                                <Label htmlFor="name" className="flex text-oxfordBlue">
                                    Nome <CircleAlert className="ml-2" size={12} color={'red'}/>
                                </Label>
                                <Input
                                    id="name"
                                    name="name"
                                    value={leadData?.name}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className="col-span-2 space-y-2">
                                <Label htmlFor="phone" className="flex text-oxfordBlue">
                                    Telefone <CircleAlert className="ml-2" size={12} color={'red'}/>
                                </Label>
                                <Input
                                    id="phoneNumber"
                                    name="phoneNumber"
                                    placeholder="Telefone com DDD"
                                    value={leadData?.phoneNumber}
                                    onChange={handleInputChange}
                                    className="flex-grow"
                                />
                            </div>

                            <div className=" space-y-2">
                                <Label htmlFor="contactChannel" className="flex text-oxfordBlue">
                                    Canal de Contato <CircleAlert className="ml-2" size={12} color={'red'}/>
                                </Label>
                                <Select
                                    value={selectedChannelContact}
                                    onValueChange={setSelectedChannelContact}
                                >
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
                                <Label htmlFor="canal" className="flex text-oxfordBlue">
                                    Canal de Captação <CircleAlert className="ml-2" size={12} color={'red'}/>
                                </Label>
                                <Select defaultValue={dadosIniciais?.canal} value={selectedCanal} onValueChange={setSelectedCanal}>
                                    <SelectTrigger id="canal">
                                        <SelectValue placeholder="Canal de Captação"/>
                                    </SelectTrigger>
                                    <SelectContent>
                                        {canal.map((c) => (
                                            <SelectItem key={c.id?.toString()} value={c.id?.toString()}>                                                {c.canal}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            {canal.map((item) => {
                                if ((Number(selectedCanal) == item.id) && (item.canal == "Indicação" || item.canal == "Outros")) {
                                    return (
                                        <div className="space-y-2" key={item.id}>
                                            <Label htmlFor="indication_name" className="text-oxfordBlue">
                                                Nome
                                            </Label>
                                            <Input
                                                id="indication_name"
                                                name="indication_name"
                                                type="text"
                                                value={leadData?.indication_name}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                    )
                                }
                                return null
                            })}
                            <div className="space-y-2">
                                <Label htmlFor="callDate" className="text-right text-oxfordBlue">
                                    Data de Contato
                                </Label>
                                <Input
                                    id="callDate"
                                    name="callDate"
                                    type="date"
                                    value={leadData?.callDate ? new Date(leadData.callDate).toISOString().split('T')[0] : ''}
                                    onChange={handleInputChange}
                                    className="col-span-3"/>
                            </div>
                            <div className="col-span-4 space-y-2">
                                <Label htmlFor="diagnosis" className="text-oxfordBlue">
                                    Diagnóstico
                                </Label>
                                <Input
                                    id="diagnosis"
                                    name="diagnosis"
                                    type="text"
                                    value={leadData?.diagnosis}
                                    onChange={handleInputChange}
                                    className="h-16"
                                />
                            </div>
                            <div className="col-span-4 space-y-2">
                                <Label htmlFor="observation" className="text-oxfordBlue">
                                    Observação
                                </Label>
                                <Input
                                    id="observation"
                                    name="observation"
                                    type="text"
                                    value={leadData?.observation}
                                    onChange={handleInputChange}
                                    className="h-8"
                                />
                            </div>

                            {/* Lead specific fields */}
                            {(
                                <>
                                    <div className=" space-y-2">
                                        <Label htmlFor="examId" className="text-oxfordBlue">
                                            Exame
                                        </Label>
                                        <Select defaultValue={dadosIniciais?.exam?.id?.toString()} value={selectedExame} onValueChange={setSelectedExame}>
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
                                            <Select value={selectedDoctor} onValueChange={setSelectedDoctor}>
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
                                        <Label htmlFor="scheduledDate" className="text-oxfordBlue">
                                            Dia do Exame
                                        </Label>
                                        <Input
                                            id="scheduledDate"
                                            name="scheduledDate"
                                            type="datetime-local"
                                            value={scheduledDate}
                                            onChange={(e) => setScheduledDate(e.target.value)}
                                        />
                                    </div>
                                </>
                            )}
                        </div>
                        <div className="flex justify-end mt-8">
                            <Button className="bg-oxfordBlue text-white" type="submit">
                                Salvar Alterações
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}

export default EditPatientAndLead