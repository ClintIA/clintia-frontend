import React, {useEffect, useState} from 'react'
import {Button} from "@/components/ui/button.tsx"
import {Input} from "@/components/ui/input.tsx"
import {Label} from "@/components/ui/label.tsx"
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle,} from "@/components/ui/card.tsx"
import {AlertCircle, BadgeInfo, CircleAlert} from "lucide-react"
import {Alert, AlertDescription, AlertTitle} from "@/components/ui/alert.tsx"
import {useAuth} from "@/hooks/auth.tsx";
import {Exams} from "@/components/AdminBooking/RegisterBookingAndPatient.tsx";
import {listTenantExam} from "@/services/tenantExamService.tsx";
import {MultiSelect} from "@/components/ui/MultiSelect.tsx";
import {Switch} from "@/components/ui/switch.tsx";
import {validarCPF, validarTelefone} from "@/lib/utils.ts";

interface RegisterDoctorProps {
    dadosIniciais?: Partial<IDoctor>
    isUpdate?: (adminData: IDoctor, tenant: number) => Promise<void>
    isDoctor?: (adminData: IDoctor, tenant: number) => Promise<void>
    title: string
}

export interface IDoctor {
    id?: number;
    cpf?: string;
    CRM?: string;
    cep?: string;
    role?: string;
    cnpj?: string;
    phone?: string;
    fullName?: string;
    email?: string;
    occupation?: string;
    sessionToken?: string;
    created_at?: string;
    tenant?: any[]; // eslint-disable-line @typescript-eslint/no-explicit-any
    exams?: number[];
}

const RegisterDoctor: React.FC<RegisterDoctorProps> = ({title,dadosIniciais, isUpdate, isDoctor}: RegisterDoctorProps) => {

    const [doctorData, setDoctorData] = useState<IDoctor>({
        fullName: '',
        cep: '',
        phone: '',
        cpf: '',
        CRM:'',
        occupation: '',
        email: '',
        exams: [],
        cnpj: '',

    })
    const [exames,  setExames] = useState<Exams[]>([])
    const [selectedExame, setSelectedExame] = useState<number[] | undefined>([]);
    const [examesIDs, setExamesIDs] = useState<string[]>([])
    const [addExam, setAddExam] = useState<boolean>(false)
    const [erro, setErro] = useState<string | null>(null)
    const auth = useAuth()

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setDoctorData(prev => ({ ...prev, [name]: value }))
    }

    useEffect(() => {
        if(dadosIniciais) {
            setDoctorData(prevDados => ({
                ...prevDados,
                ...dadosIniciais
            }))
        }
    }, [dadosIniciais])
    const fetchExams = async () => {
        try {
            if(auth.tenantId) {
                if(addExam) {
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

            }
        } catch (error) {
            setErro("Não possível carregar os procedimentos")
            console.error(error)
        }
    }
    useEffect( () => {
        fetchExams().then()
    }, [addExam]);
    const handleSelectedExames = (exames: number[]) => {
        setSelectedExame(exames)
    }
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setErro(null)

        if (!doctorData.fullName ||
            !doctorData.cep ||
            !doctorData.occupation ||
            !doctorData.CRM ||
            !doctorData.phone ||
            !doctorData.cpf) {
            setErro('Por favor, preencha todos os campos')
            return
        }

        if (!validarTelefone(doctorData.phone)) {
            setErro('Telefone inválido')
            return
        }
        if (!validarCPF(doctorData.cpf)) {
            setErro('CPF inválido')
            return
        }
        try {
            if(auth.tenantId) {

                if(isUpdate) {
                    await isUpdate(doctorData, auth.tenantId)
                        .catch((error) => console.log(error))

                }
                if(isDoctor) {
                    await isDoctor({...doctorData, exams: selectedExame}, auth.tenantId)
                        .catch((error) => console.log(error))

                }

                setDoctorData({
                    fullName: '',
                    phone: '',
                    CRM: '',
                    cpf: '',
                    occupation: '',
                    cep: '',
                    email: '',
                    cnpj: ''
                })
                setSelectedExame([])
                setAddExam(false)
                setExamesIDs([])
            }
        } catch (error) {
            setErro('Falha ao cadastrar profissional')
            console.log(error)
        }
    }

    return (
        <div className="mt-6">

            <Card className="w-full max-w-2xl mx-auto">
                <CardHeader>
                    <CardTitle className='text-oxfordBlue00 text-xl'>{title}</CardTitle>
                    <CardDescription className="text-gray-500">
                        Preencha os dados abaixo. Clique em salvar para finalizar o cadastro.
                    </CardDescription>
                   <p className="flex text-xs text-gray-500"> <CircleAlert className="mr-2" size={12} color={'red'}/> Campos Obrigátorios</p>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <Label htmlFor="fullName" className="flex text-right text-oxfordBlue00 mb-2">
                                    Nome <CircleAlert className="ml-2" size={12} color={'red'}/>
                                </Label>
                                <span className="flex flex-col col-span-3">
                                   <Input
                                       id="fullName"
                                       name="fullName"
                                       type="text"
                                       value={doctorData.fullName}
                                       onChange={handleInputChange}
                                   />
                                       <span className="flex text-xs text-gray-500 mt-2"> <BadgeInfo className="mr-1"
                                                                                                     size={12}/> Nome completo conforme registro profissional.</span>
                                   </span>
                            </div>
                            <div>
                                <div>
                                    <Label htmlFor="cpf" className="flex text-right text-oxfordBlue00 mb-2">
                                        CPF <CircleAlert className="ml-2" size={12} color={'red'}/>
                                    </Label>
                                    <span className="flex flex-col col-span-3">
                                    <Input
                                        id="cpf"
                                        name="cpf"
                                        type="text"
                                        value={doctorData?.cpf}
                                        onChange={handleInputChange}
                                        className="col-span-3"/>
                                    <span className="flex text-xs text-gray-500 mt-2"> <BadgeInfo className="mr-1"
                                                                                                  size={12}/> CPF: Número de identificação pessoa física.</span>
                                   </span>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <Label htmlFor="CRM" className="flex text-right text-oxfordBlue00 mb-2">
                                    RPS <CircleAlert className="ml-2" size={12} color={'red'}/>
                                </Label>
                                <span className="flex flex-col col-span-3">

                                <Input
                                    id="CRM"
                                    name="CRM"
                                    type="text"
                                    value={doctorData?.CRM}
                                    onChange={handleInputChange}
                                />
                                     <span className="flex text-xs text-gray-500 mt-2"> <BadgeInfo className="mr-1"
                                                                                                   size={12}/>Registro do profissional: CRM, CREFITO, etc...</span>
                                </span>
                            </div>
                            <div>
                                <Label htmlFor="occupation" className="flex text-right text-oxfordBlue00 mb-2">
                                    Ocupação <CircleAlert className="ml-2" size={12} color={'red'}/>
                                </Label>
                                <span className="flex flex-col">
                                <Input
                                    id="occupation"
                                    name="occupation"
                                    type="text"
                                    value={doctorData?.occupation}
                                    onChange={handleInputChange}
                                />
                                    <span className="flex text-xs text-gray-500 mt-2"> <BadgeInfo
                                        className="mr-1" size={12}/> Área de especialização. Ex: Cardiologista.</span>
                                   </span>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <Label htmlFor="fullName" className="flex text-right text-oxfordBlue00 mb-2">
                                    E-mail <CircleAlert className="ml-2" size={12} color={'red'}/>
                                </Label>
                                <span className="flex flex-col col-span-3">
                                   <Input
                                       id="email"
                                       name="email"
                                       type="text"
                                       value={doctorData.email}
                                       onChange={handleInputChange}
                                   />
                                       <span className="flex text-xs text-gray-500 mt-2"> <BadgeInfo className="mr-1"
                                                                                                     size={12}/> E-mail para acesso a plataforma.</span>
                                   </span>
                            </div>
                            <div>
                                <Label htmlFor="email" className="flex text-right text-oxfordBlue00 mb-2">
                                    CNPJ
                                </Label>
                                <span className="flex flex-col col-span-3">
                                <Input
                                    id="cnpj"
                                    name="cnpj"
                                    type="text"
                                    value={doctorData.cnpj}
                                    onChange={handleInputChange}
                                    className="col-span-3"/>
                                    <span className="flex text-xs text-gray-500 mt-2"> <BadgeInfo
                                        className="mr-1" size={12}/>Registro de pessoa jurídica, caso tenha.</span>
                                   </span>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <Label htmlFor="phone" className="flex text-right text-oxfordBlue00 mb-2">
                                    Telefone <CircleAlert className="ml-2" size={12} color={'red'}/>
                                </Label>
                                <span className="flex flex-col col-span-3">
                                <Input
                                    id="phone"
                                    name="phone"
                                    type="tel"
                                    value={doctorData.phone}
                                    onChange={handleInputChange}
                                    className="col-span-3"/>
                                    <span className="flex text-xs text-gray-500 mt-2"> <BadgeInfo
                                        className="mr-1" size={12}/> Telefone para contato. EX: 22999999999.</span>
                                   </span>
                            </div>
                            <div>
                                <Label htmlFor="phone" className="flex text-right text-oxfordBlue00 mb-2">
                                    CEP
                                </Label>
                                <span className="flex flex-col col-span-3">
                                <Input
                                    id="cep"
                                    name="cep"
                                    type="tel"
                                    value={doctorData.cep}
                                    onChange={handleInputChange}
                                />
                                    <span className="flex text-xs text-gray-500 mt-2"> <BadgeInfo
                                        className="mr-1" size={12}/> CEP do endereço residencial.</span>
                                   </span>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <Label htmlFor="gender" className="flex text-right text-oxfordBlue00 mb-2">
                                    Deseja adicionar exame(s) ?
                                </Label>
                                <span className="flex flex-col mt-3">

                                <div className="flex flex-row gap-2">
                                    <Switch
                                        id="toggle-select"
                                        checked={addExam}
                                        onCheckedChange={setAddExam}
                                    />
                                </div>
                                    <span className="flex text-xs text-gray-500 mt-2"> <BadgeInfo
                                        className="mr-1" size={12}/> Selecione para adicionar procedimentos.</span>
                                   </span>
                            </div>
                        </div>
                        {addExam && (
                            <div className="grid gap-2">
                                <MultiSelect
                                    options={exames}
                                    atribbute="exam_name"
                                    onValueChange={handleSelectedExames}
                                    defaultValue={examesIDs}
                                    placeholder="Selecione o(s) exame(s)"
                                    variant="inverted"
                                    className="max-w-xl"
                                />
                            </div>
                        )}

                        <div className="flex justify-end mt-6">
                            {isDoctor && (
                                <Button className="bg-oxfordBlue text-white" type="submit">Cadastrar</Button>
                            )}
                            {isUpdate && (
                                <Button className="bg-oxfordBlue text-white" type="submit">Atualizar
                                </Button>
                            )}
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
export default RegisterDoctor;