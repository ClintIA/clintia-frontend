import React, {useCallback, useEffect, useState} from "react";
import {Input} from "@/components/ui/input.tsx";
import {Button} from "@/components/ui/button.tsx";
import {useAuth} from "@/hooks/auth.tsx";
import {Card, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card.tsx";
import {deleteCanalMarketing, listCanalMarketing} from "@/services/marketingService.ts";
import {Alert, AlertDescription, AlertTitle} from "@/components/ui/alert.tsx";
import {AlertCircle, Trash2} from "lucide-react";
import GeneralModal from "@/components/ModalHandle/GeneralModal.tsx";

export interface IMarketing {
    id?: number
    canal: string
    budgetCanal: string
    createdBy?: number
    uploadBy?: number
}

export interface RegisterCanalProps {
    isCanal?: (marketingData: IMarketing, tenantID: number) => Promise<void>
    isUpdate?: (marketingData: IMarketing, tenantID: number) => Promise<void>
    totalBudget?: number
    title: string
}

const RegisterCanal: React.FC<RegisterCanalProps> = ({title, isCanal, isUpdate, totalBudget}:RegisterCanalProps) => {

    const [updateCanalData, setUpdateCanalData] = useState<IMarketing>({} as IMarketing)
    const [newCanalData,setNewCanalData] = useState<IMarketing>({
        canal: '',
        budgetCanal: ''
    })
    const [ totalBudgetUsed, setTotalBudgetUsed ] = useState(0)
    const [erro, setErro] = useState<string | null>(null)
    const [titleModal,setTitleModal] = useState("");
    const [action,setAction] = useState("");
    const [isError, setIsError] = useState(false);
    const [generalMessage, setGeneralMessage] = useState<string>('')
    const [isGeneralModalOpen, setIsGeneralModalOpen] = useState(false)
    const [deleteId, setDeleteId] = useState<number>()
    const [listCanal, setListCanal] = useState<IMarketing[]>([])
    const auth = useAuth();
    const handleInputChangeNew = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target
        setNewCanalData(prev => ({ ...prev, [name]: value }))
    }
    const handleInputChangeUpdate = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target
        setUpdateCanalData(prev => ({ ...prev, [name]: value }))
    }
    const fetchCanal = useCallback(async () => {
        if (auth.tenantId) {
            const result = await listCanalMarketing(auth.tenantId)

            if (result.data) {
                setListCanal(result.data.data)
                setTotalBudgetUsed(listCanal.reduce((sum, alloc) => Number(sum) + Number(alloc.budgetCanal), 0))
            }
        }
    }, [auth.tenantId, listCanal])

    useEffect(   () => {
    fetchCanal().then()
    }, []);
    const handleConfirmationDelete = (id: number | undefined) => {
        setGeneralMessage("Deseja deletar o canal selecionado?")
        setTitleModal('Confirmação de Exclusão')
        setAction('Excluir')
        setIsError(true)
        setDeleteId(id)
        setIsGeneralModalOpen(true)

    }
    const handleNewCanalSubmit = async (event: React.FormEvent) => {
        event.preventDefault()
        if(!newCanalData.canal || !newCanalData.budgetCanal){
            setErro('Por favor, preencha os dois campos novamente')
            return
        }
        if(isCanal && auth.tenantId) {
            setErro(null)
            const newCanal = {...newCanalData,
                budgetCanal: newCanalData.budgetCanal.replace(',', '.'),
                uploadBy: auth.userId,
                createdBy: auth.userId
            }
            await isCanal(newCanal, auth.tenantId)
                .then(() => {
                    setNewCanalData({
                        canal: '',
                        budgetCanal: ''
                    });
                    fetchCanal().then();
                })
                .catch((error) => console.log(error))
        }
    }
    const deleteCanal = async () => {
        try {
            await deleteCanalMarketing(auth.tenantId, deleteId)
        } catch (error) {
            console.log(error)
        }
    }
    const handleClose = () => {
        setIsGeneralModalOpen(false)
        fetchCanal().then()
    }
    const handleUpdateCanalSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        if(!updateCanalData.canal || !updateCanalData.budgetCanal){
            setErro('Por favor, preencha os dois campos novamente')
            return
        }
        if(isUpdate && auth.tenantId) {
            setErro(null)
            const updateCanal = {...updateCanalData,
                id: event.target[1].value,
                budgetCanal: updateCanalData.budgetCanal.replace(',', '.'),
                uploadBy: auth.userId,
            }
            await isUpdate(updateCanal,
                auth.tenantId)
                .then(() => fetchCanal().then())
                .catch((error) => console.log(error))
        }

    }
    return (
        <Card className="py-4 px-4">
            <CardHeader>
                <CardTitle className='text-oxfordBlue00 text-xl'>{title}</CardTitle>
                <CardDescription>
                    Gerenciamento de canais
                </CardDescription>
            </CardHeader>
            <div className="flex flex-col">
                <div className="flex flex-row gap-2 p-1">
                    <div className="w-auto sm:w-2/4 flex justify-center">
                        <p className=" font-semibold text-oxfordBlue">Canal de Alocação</p>
                    </div>
                    <div className="w-auto sm:w-1/4 flex justify-center">
                        <p className="font-semibold text-oxfordBlue">Valor de Alocação</p>
                    </div>
                </div>
                {listCanal.map((canal) => (
                    <form key={canal.id} onSubmit={handleUpdateCanalSubmit}>
                        <div className="flex flex-row justify-between gap-2 p-1">
                            <div className="w-auto sm:w-2/4">
                                <Input id="canal" className="!placeholder-black" onChange={handleInputChangeUpdate}
                                       name="canal"
                                       placeholder={canal.canal}/>
                                <input id="idCanal" readOnly={true} className="hidden" name="idCanal" value={canal.id}/>
                            </div>
                            <div className="w-auto sm:w-1/4">
                                <Input id="budgetCanal" className="!placeholder-black"
                                       onChange={handleInputChangeUpdate}
                                       name="budgetCanal"
                                       placeholder={canal.budgetCanal?.toString()}/>
                            </div>
                            <div className="w-auto sm:w-1/4">
                                <div className="flex flex-row space-x-3">
                                    <Button
                                        className="bg-oxfordBlue text-white hover:bg-blue-900" type="submit">Atualizar
                                    </Button>
                                    <Button className="" onClick={() => handleConfirmationDelete(canal.id)}><Trash2 color='red'/>
                                    </Button>
                                </div>

                            </div>
                        </div>
                    </form>
                ))}
                    <div className="flex flex-col justify-between mt-2 gap-2">
                        <p className='text-oxfordBlue font-semibold'><strong>Total Distribuído:</strong> R$ {totalBudgetUsed}</p>
                        <p><strong>Orçamento
                            Restante:</strong> <span className={(Number(totalBudget) - totalBudgetUsed) < 0 ? 'text-red-700 font-bold' : 'text-oxfordBlue font-semibold'}>R$ {(Number(totalBudget) - totalBudgetUsed)  }</span></p>
                </div>
                <form onSubmit={handleNewCanalSubmit}>
                    <div className="flex flex-row justify-between gap-2 mt-5">
                        <div className="w-2/4">
                            <Input placeholder="Digite o Canal" className="text-black" id="canal"
                                   onChange={handleInputChangeNew} name="canal"
                                   value={newCanalData?.canal}/>
                        </div>
                        <div className="w-1/4">
                            <Input placeholder="Valor de Alocação" id="budgetCanal" className="text-black"
                                   onChange={handleInputChangeNew} name="budgetCanal"
                                   value={newCanalData?.budgetCanal}/>
                        </div>
                        <div className="w-1/4">
                            <Button
                                className="bg-oxfordBlue text-white hover:bg-blue-900" type="submit">Criar
                                Canal</Button>
                        </div>
                    </div>
                </form>
            </div>
            <GeneralModal
                title={titleModal}
                action={action}
                error={isError}
                isOpen={isGeneralModalOpen}
                isDelete={deleteCanal}
                onClose={handleClose}
                message={generalMessage}/>

            <CardFooter className="mt-3 flex justify-center">
                {erro && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4"/>
                        <AlertTitle>Erro</AlertTitle>
                        <AlertDescription>{erro}</AlertDescription>
                    </Alert>
                )}
            </CardFooter>
        </Card>
    )
}
export default RegisterCanal;