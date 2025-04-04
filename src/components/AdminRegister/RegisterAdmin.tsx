import React, {useEffect, useState} from 'react'
import {Button} from "@/components/ui/button.tsx"
import {Input} from "@/components/ui/input.tsx"
import {Label} from "@/components/ui/label.tsx"
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle,} from "@/components/ui/card.tsx"
import {AlertCircle, BadgeInfo} from "lucide-react"
import {Alert, AlertDescription, AlertTitle} from "@/components/ui/alert.tsx"
import {useAuth} from "@/hooks/auth.tsx";
import {validarCPF, validarEmail, validarTelefone} from "@/lib/utils.ts";
import {IAdmin} from "@/types/dto/Admin.ts";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select.tsx";
import {roleOptions} from "@/lib/optionsFixed.ts";
import {registerAdmin, updateAdmin} from "@/services/adminsService.tsx";
import {toast} from "@/hooks/use-toast.ts";

interface RegisterAdminProps {
    dadosIniciais?: Partial<IAdmin>
    title: string
}

const RegisterAdmin: React.FC<RegisterAdminProps> = ({title, dadosIniciais}: RegisterAdminProps) => {

    const [adminData, setAdminData] = useState<IAdmin>({
        fullName: '',
        email: '',
        phone: '',
        cpf: '',
        cep:'',
        role:'',
    })
    const [erro, setErro] = useState<string | null>(null)
    const [selectedRole, setSelectedRole] = useState<string | undefined>('')
    const auth = useAuth()

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setAdminData(prev => ({ ...prev, [name]: value }))
    }
    const submitNewAdmin = async (adminData: IAdmin,tenantId: number) => {
            await registerAdmin(adminData,tenantId)
                .then((result) => {
                    console.log(result)
                    if (result.status === "success") {
                        toast({
                            title: 'Clintia',
                            description: 'Administrador salvo com sucesso'
                        })
                        window.location.reload()
                    } else {
                        toast({
                            variant: 'destructive',
                            title: 'Clintia',
                            description: 'Erro ao salvar Administrador, verifique os dados: ' + result.message
                        })
                    }
                }).catch(error => {console.log(error)})
    }
    const submitUpdateAdmin = async (adminData: IAdmin,tenantId: number) => {
            await updateAdmin(adminData,tenantId)
                .then((result) => {
                    console.log(result)
                    if (result.status === "success") {
                        toast({
                            title: 'Clintia',
                            description: 'Administrador atualizado com sucesso'
                        })
                        window.location.reload()
                    } else {
                        toast({
                            variant: 'destructive',
                            title: 'Clintia',
                            description: 'Erro ao salvar Administrador, verifique os dados: ' + result.message
                        })
                    }
                }).catch(error => {console.log(error)})
    }

    useEffect(() => {
        if(dadosIniciais) {
            setAdminData(prevDados => ({
                ...prevDados,
                ...dadosIniciais
            }))
            setSelectedRole(dadosIniciais.role)
        }
    }, [dadosIniciais])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setErro(null)
        adminData.role = selectedRole
        if (
            !adminData.fullName ||
            !adminData.email ||
            !adminData.phone ||
            !adminData.cpf ||
            !adminData.cep ||
            !adminData.role) {
            setErro('Por favor, preencha todos os campos')
            return
        }
         if (!validarEmail(adminData.email)) {
            setErro('Email Inválido')
             return
        }
        if (!validarCPF(adminData.cpf)) {
            setErro('CPF Inválido')
            return
        }
         if (!validarTelefone(adminData.phone)) {
            setErro('Telefone inválido')
             return
        }

        try {
            if(auth.tenantId) {
                if(!dadosIniciais) {
                    await submitNewAdmin(adminData,auth.tenantId)
                }

                if(dadosIniciais) {
                    await submitUpdateAdmin(adminData,auth.tenantId)
                }
                setAdminData({
                    fullName: '',
                    email: '',
                    phone: '',
                    cep: '',
                    cpf: '',
                })
                setSelectedRole('')
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
                       <CardDescription>
                           Preencha os dados abaixo. Clique em salvar para finalizar o cadastro.
                       </CardDescription>
                   </CardHeader>
                   <CardContent>
                       <form onSubmit={handleSubmit}>

                           <div className="grid gap-4">
                               <div className="grid grid-cols-4 items-center gap-4">
                                   <Label htmlFor="cpf" className="text-right text-oxfordBlue00">
                                       Nome
                                   </Label>
                                   <span className="flex flex-col col-span-3">
                                   <Input
                                       id="fullName"
                                       name="fullName"
                                       type="text"
                                       value={adminData.fullName}
                                       onChange={handleInputChange}
                                   />
                                       <span className="flex text-xs text-gray-500"> <BadgeInfo className="mt-0.5 mr-1" size={12}/> Nome completo.</span>
                                   </span>
                               </div>
                               <div className="grid grid-cols-4 items-center gap-4">
                                   <Label htmlFor="cpf" className="text-right text-oxfordBlue00">
                                       CPF
                                   </Label>
                                   <span className="flex flex-col col-span-3">
                                   <Input
                                       id="cpf"
                                       name="cpf"
                                       type="text"
                                       value={adminData.cpf}
                                       onChange={handleInputChange}
                                   />
                                       <span className="flex text-xs text-gray-500 "> <BadgeInfo className="mt-0.5 mr-1" size={12}/> Documento de identificação.</span>
                                   </span>
                               </div>
                               <div className="grid grid-cols-4 items-center gap-4">
                                   <Label htmlFor="email" className="text-right text-oxfordBlue00">
                                       Email
                                   </Label>
                                   <span className="flex flex-col col-span-3">
                                   <Input
                                       id="email"
                                       name="email"
                                       type="text"
                                       value={adminData.email}
                                       onChange={handleInputChange}
                                   />
                                       <span className="flex text-xs text-gray-500 "> <BadgeInfo className="mt-0.5 mr-1" size={12}/> E-mail para acesso a plataforma.</span>
                                   </span>
                               </div>
                               <div className="grid grid-cols-4 items-center gap-4">
                                   <Label htmlFor="email" className="text-right text-oxfordBlue00">
                                       CEP
                                   </Label>
                                   <span className="flex flex-col col-span-3">
                                   <Input
                                       id="cep"
                                       name="cep"
                                       type="text"
                                       value={adminData.cep}
                                       onChange={handleInputChange}
                                   />
                                       <span className="flex text-xs text-gray-500 "> <BadgeInfo className="mt-0.5 mr-1" size={12}/> Número do CEP.</span>
                                   </span>
                               </div>
                               <div className="grid grid-cols-4 items-center gap-4">
                                   <Label htmlFor="phone" className="text-right text-oxfordBlue00">
                                       Telefone
                                   </Label>
                                   <span className="flex flex-col col-span-3">
                                   <Input
                                       id="phone"
                                       name="phone"
                                       type="text"
                                       value={adminData.phone}
                                       onChange={handleInputChange}
                                   />
                                       <span className="flex text-xs text-gray-500 "> <BadgeInfo className="mt-0.5 mr-1" size={12}/> Telefone para contato.</span>
                                   </span>
                               </div>
                               <div className="grid grid-cols-4 items-center gap-4">
                                   <Label htmlFor="gender" className="text-right text-oxfordBlue00">
                                       Perfil
                                   </Label>

                                   <div className="flex flex-row gap-2 col-span-3">
                                       <span
                                           className="flex flex-row max-w-max text-xs">
                                    <Select value={selectedRole} onValueChange={setSelectedRole}>
                                           <SelectTrigger className="max-w-max " id="canal">
                                               <SelectValue placeholder="Selecione o Perfil"/>
                                           </SelectTrigger>
                                           <SelectContent>
                                               {roleOptions.map((canal) => !canal.disable ? (
                                                   <SelectItem key={canal.value} value={canal.value}>
                                                       {canal.label}
                                                   </SelectItem>
                                               ) : '')}
                                           </SelectContent>
                                       </Select>
                                       <span className="flex  text-xs text-gray-500 m-auto"> <BadgeInfo className="ml-1 mr-1" size={14}/>Perfil de acesso.</span>
                                   </span>
                                   </div>
                               </div>

                           </div>
                           <div className="flex justify-end mt-6">
                               {!dadosIniciais && (
                                   <Button className="bg-oxfordBlue text-white" type="submit">Cadastrar</Button>
                               )}
                               {dadosIniciais && (
                                   <Button className="bg-oxfordBlue text-white" type="submit">Atualizar
                                   </Button>
                               )}                           </div>
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
export default RegisterAdmin;