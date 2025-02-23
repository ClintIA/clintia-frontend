import React, {useCallback, useEffect, useState} from 'react'
import {Button} from "@/components/ui/button.tsx"
import {Input} from "@/components/ui/input.tsx"
import {Label} from "@/components/ui/label.tsx"
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle,} from "@/components/ui/card.tsx"
import {AlertCircle} from "lucide-react"
import {Alert, AlertDescription, AlertTitle} from "@/components/ui/alert.tsx"
import {registerPatient} from "@/services/loginService.tsx";
import {ITokenPayload} from "@/types/Auth.ts";
import {jwtDecode} from "jwt-decode";
import {useAuth} from "@/hooks/auth.tsx";
import {validarDataNascimento, validarEmail, validarTelefone} from "@/lib/utils.ts";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select.tsx";
import {genderOptions} from "@/lib/optionsFixed.ts";
import {listCanalMarketing} from "@/services/marketingService.ts";
import {IMarketing} from "@/types/Marketing.ts";

export interface DadosPaciente {
    id?: number
    full_name?: string
    email?: string
    phone?: string
    dob?: string
    cpf?: string
    cep?: string
    diagnostic?: string
    canal?: string
    gender?: string
    exams?: any[]
    role?: string
    sessionToken?: string
    created_at?: string
    health_card_number?: string
    tenants?: any[]
}

interface RegisterPatientProps {
    dadosIniciais?: Partial<DadosPaciente>
    onCadastroConcluido?: (dados: DadosPaciente) => void
    isUpdate?: (pacienteDados: DadosPaciente, tenant: number) => Promise<any>
    isNewPatient?: (pacienteDados: DadosPaciente, tenant: number) => Promise<any>
    title: string
}

const RegisterPatient: React.FC<RegisterPatientProps> = ({title, dadosIniciais, onCadastroConcluido, isUpdate, isNewPatient}: RegisterPatientProps) => {

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
    const [tenant, setTenant] = useState<number | undefined>(undefined)
    const [erro, setErro] = useState<string | null>(null)
    const [selectedCanal, setSelectedCanal] = useState<string | undefined>('')
    const [canal, setCanal] = useState<IMarketing[]>([])

    const auth = useAuth()

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setDadosPaciente(prev => ({ ...prev, [name]: value }))
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
    useEffect(() => {
        const getTenant = () => {
            if(auth?.token) {
                const decoded: ITokenPayload = jwtDecode(auth.token?.toString())
                setTenant(decoded.tenantId)
            }
        }
        getTenant()
    },[auth.token])
    useEffect(() => {
        if(dadosIniciais) {
            setSelectedCanal(dadosIniciais?.canal)
            setDadosPaciente(prevDados => ({
                ...prevDados,
                ...dadosIniciais
            }))
        }
    }, [dadosIniciais])

    const createDate = (date: string) => {
        const dateArray = date.split('-')
        return dateArray[0] + "-" + dateArray[1] + "-" + dateArray[2]
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setErro(null)
        dadosPaciente.canal = selectedCanal;
        if (!dadosPaciente.full_name ||
            !dadosPaciente.email ||
            !dadosPaciente.phone ||
            !dadosPaciente.dob ||
            !dadosPaciente.cep ||
            !dadosPaciente.canal ||
            !dadosPaciente.gender ||
            !dadosPaciente.cpf ||
            !dadosPaciente.health_card_number) {
            setErro('Por favor, preencha todos os campos')
            return
        }
         if (!validarEmail(dadosPaciente.email)) {
            setErro('Email Inválido')
             return
        }
         if (!validarTelefone(dadosPaciente.phone)) {
            setErro('Telefone inválido')
             return
        }
        if (!validarDataNascimento(dadosPaciente.dob)) {
            setErro('Data de nascimento inválida')
            return
        }

        try {
            if(tenant) {
                const pacienteDados = { ...dadosPaciente, cpf: dadosPaciente.cpf.replace(/\D/g, ''), dob: createDate(dadosPaciente.dob) }
                if(isUpdate) {
                    await isUpdate(pacienteDados, tenant)
                        .catch((error) => console.log(error))
                    return
                }
                if(isNewPatient) {
                    await isNewPatient(pacienteDados, tenant)
                         .catch((error) => console.log(error))
                    return
                }
                const result = await registerPatient(pacienteDados, tenant)
                if(result?.data.status === 'success') {
                    if (onCadastroConcluido) {
                        onCadastroConcluido(dadosPaciente)
                    }
                } else {
                    setErro('Falha ao cadastrar paciente. '+ result?.message)
                    return
                }
                setDadosPaciente({
                    full_name: '',
                    email: '',
                    phone: '',
                    dob: '',
                    canal: '',
                    cpf: '',
                    cep: '',
                    gender: '',
                    health_card_number: '',
                })
            }
        } catch (error) {
            setErro('Falha ao cadastrar paciente')
            console.log(error)
        }
    }

   return (
           <div className="mt-6">
               <Card className="w-full max-w-2xl mx-auto">
                   <CardHeader>
                       <CardTitle className='text-oxfordBlue text-xl'>{title}</CardTitle>
                       <CardDescription>
                           Preencha os detalhes do paciente abaixo. Clique em salvar quando terminar.
                       </CardDescription>
                   </CardHeader>
                   <CardContent>
                       <form onSubmit={handleSubmit}>

                           <div className="grid gap-4">
                               <div className="grid grid-cols-4 items-center gap-4">
                                   <Label htmlFor="full_name" className="text-right text-oxfordBlue">
                                       Nome
                                   </Label>
                                   <Input
                                       id="full_name"
                                       name="full_name"
                                       value={dadosPaciente.full_name}
                                       onChange={handleInputChange}
                                       className="col-span-3"/>
                               </div>
                               <div className="grid grid-cols-4 items-center gap-4">
                                   <Label htmlFor="email" className="text-right text-oxfordBlue">
                                       Email
                                   </Label>
                                   <Input
                                       id="email"
                                       name="email"
                                       type="email"
                                       value={dadosPaciente.email}
                                       onChange={handleInputChange}
                                       className="col-span-3"/>
                               </div>
                               <div className="grid grid-cols-4 items-center gap-4">
                                   <Label htmlFor="phone" className="text-right text-oxfordBlue">
                                       Telefone
                                   </Label>
                                   <Input
                                       id="phone"
                                       name="phone"
                                       type="tel"
                                       value={dadosPaciente.phone}
                                       onChange={handleInputChange}
                                       className="col-span-3"/>
                               </div>
                               <div className="grid grid-cols-4 items-center gap-4">
                                   <Label htmlFor="dob" className="text-right text-oxfordBlue">
                                       Data de Nascimento
                                   </Label>
                                   <Input
                                       id="dob"
                                       name="dob"
                                       type="date"
                                       value={dadosPaciente.dob}
                                       onChange={handleInputChange}
                                       className="col-span-3"/>
                               </div>
                               <div className="grid grid-cols-4 items-center gap-4">
                                   <Label htmlFor="cpf" className="text-right text-oxfordBlue">
                                       CPF
                                   </Label>
                                   <Input
                                       id="cpf"
                                       name="cpf"
                                       value={dadosPaciente?.cpf}
                                       onChange={handleInputChange}
                                       className="col-span-3"/>
                               </div>
                               <div className="grid grid-cols-4 items-center gap-4">
                                   <Label htmlFor="cep" className="text-right text-oxfordBlue">
                                       CEP
                                   </Label>
                                   <Input
                                       id="cep"
                                       name="cep"
                                       type="number"
                                       value={dadosPaciente.cep}
                                       onChange={handleInputChange}
                                       className="col-span-3"/>
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
                                               checked={dadosPaciente.gender === option.value}
                                               onChange={handleInputChange}
                                               className="form-radio h-4 w-4 text-oxfordBlue focus:ring-blue-800 border-gray-300"
                                           />
                                           <span className="w-max text-sm text-oxfordBlue">{option.label}</span>
                                       </label>
                                   ))}
                                   </div>
                               </div>
                               <div className="grid grid-cols-4 items-center gap-4">
                                   <Label htmlFor="health_card_number" className="text-right text-oxfordBlue00">
                                        Plano de Saúde
                                   </Label>
                                   <Input
                                       id="health_card_number"
                                       name="health_card_number"
                                       placeholder="Particular"
                                       value={dadosPaciente.health_card_number}
                                       onChange={handleInputChange}
                                       className="col-span-3"/>
                               </div>
                               <div className="grid grid-cols-4 items-center gap-4">
                                   <Label className="text-right text-oxfordBlue00" htmlFor="examId">Selecione o
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
                           <div className="flex justify-end mt-6">
                               {isNewPatient && (
                                   <Button className="bg-oxfordBlue text-white" type="submit">Salvar Paciente</Button>
                               )}
                               {isUpdate && (
                                   <Button className="bg-oxfordBlue text-white" type="submit">Atualizar
                                       Paciente</Button>
                               )}
                               {onCadastroConcluido && (
                                   <Button className="bg-oxfordBlue text-white" type="submit">Salvar Paciente</Button>
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
export default RegisterPatient;