import React, {useCallback, useEffect, useState} from 'react'
import {Button} from "@/components/ui/button.tsx"
import {Input} from "@/components/ui/input.tsx"
import {Label} from "@/components/ui/label.tsx"
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle,} from "@/components/ui/card.tsx"
import {AlertCircle} from "lucide-react"
import {Alert, AlertDescription, AlertTitle} from "@/components/ui/alert.tsx"
import {useAuth} from "@/hooks/auth.tsx";
import {validarTelefone} from "@/lib/utils.ts";
import {genderOptions} from "@/lib/optionsFixed.ts";
import {listCanalMarketing} from "@/services/marketingService.ts";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select.tsx";
import {IMarketing} from "@/types/Marketing.ts";



export interface LeadRegisterDTO {
    full_name: string;
    phone: string;
    obs?: string;
    canal?: string;
    gender?: string;
    tenants?: any;
}

interface LeadRegisterProps {
    newLead?: (pacienteDados: LeadRegisterDTO, tenant: number) => Promise<any>
    title: string
}

const LeadRegister: React.FC<LeadRegisterProps> = ({title, newLead}: LeadRegisterProps) => {

    const [leadRegister, setLeadRegister] = useState<LeadRegisterDTO>({
        full_name: '',
        phone: '',
        obs: '',
        canal: '',
        gender: '',
    })
    const [erro, setErro] = useState<string | null>(null)
    const [canal, setCanal] = useState<IMarketing[]>([])
    const [selectedCanal, setSelectedCanal] = useState<string | undefined>('')

    const auth = useAuth()

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setLeadRegister(prev => ({ ...prev, [name]: value }))
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setErro(null)
        if (!leadRegister.full_name || !leadRegister.phone) {
            setErro('Por favor, preencha todos os campos')
            return
        }

         if (!validarTelefone(leadRegister.phone)) {
            setErro('Telefone inválido')
             return
        }
         leadRegister.canal = selectedCanal

        try {
            if(auth.tenantId) {
                if (newLead) {
                    await newLead(leadRegister, auth.tenantId)
                        .catch((error) => console.log(error))
                    return
                } else {
                    setErro('Falha ao cadastrar lead')
                    return
                }
            }
                setLeadRegister({
                    full_name: '',
                    phone: '',
                    obs: '',
                    canal: '',
                    gender: '',
                })
        } catch (error) {
            setErro('Falha ao cadastrar lead')
            console.log(error)
        }
    }

   return (
           <div className="mt-6">
               <Card className="w-full max-w-2xl mx-auto">
                   <CardHeader>
                       <CardTitle className='text-oxfordBlue text-xl'>{title}</CardTitle>
                       <CardDescription>
                           Preencha os dados abaixo. Clique em salvar quando terminar.
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
                                       value={leadRegister.full_name}
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
                                       placeholder='22999999999'
                                       value={leadRegister.phone}
                                       onChange={handleInputChange}
                                       className="col-span-3"/>
                               </div>
                               <div className="grid grid-cols-4 items-center gap-4">
                                   <Label htmlFor="phone" className="text-right text-oxfordBlue">
                                       Selecione o Canal de Captação</Label>
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
                               <div className="grid grid-cols-4 items-center gap-4">
                                   <Label htmlFor="obs" className="text-right text-oxfordBlue">
                                       Observação
                                   </Label>
                                   <Input
                                       id="obs"
                                       name="obs"
                                       type="text"
                                       value={leadRegister.obs}
                                       onChange={handleInputChange}
                                       className="col-span-3 h-20"/>
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
                                                   checked={leadRegister.gender === option.value}
                                                   onChange={handleInputChange}
                                                   className="form-radio h-4 w-4 text-oxfordBlue focus:ring-blue-800 border-gray-300"
                                               />
                                               <span className="w-max text-sm text-oxfordBlue">{option.label}</span>
                                           </label>
                                       ))}
                                   </div>
                               </div>

                           </div>
                           <div className="flex justify-end mt-6">
                               {newLead && (
                                   <Button className="bg-oxfordBlue text-white" type="submit">Registrar Contato</Button>
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
export default LeadRegister;