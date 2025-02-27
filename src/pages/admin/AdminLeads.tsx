import React, {useCallback, useEffect, useState} from 'react'
import {Card, CardContent} from "@/components/ui/card.tsx"
import {Input} from "@/components/ui/input.tsx"
import {Label} from "@/components/ui/label.tsx"
import {Table, TableHead, TableHeader, TableRow} from "@/components/ui/table.tsx"
import Cards from "@/components/Card.tsx";
import {deletePatient,} from "@/services/patientService.tsx";
import {useAuth} from "@/hooks/auth.tsx";
import {DadosPaciente} from "@/components/AdminPatient/RegisterPatient.tsx";
import Loading from "@/components/Loading.tsx";
import ModalRender from "@/components/ModalHandle/ModalRender.tsx";
import DataTable from "@/components/DataTable.tsx";
import GeneralModal from "@/components/ModalHandle/GeneralModal.tsx";
import {TableCell} from "@mui/material";
import {ModalType} from "@/types/ModalType.ts";
import NoDataTable from "@/components/NoDataTable.tsx";
import {listLeadsByTenant} from "@/services/leadService.tsx";
import {CreateLeadDTO} from "@/types/dto/CreateLead.ts";

const AdminLeads: React.FC = () => {

    const [title,setTitle] = useState("");
    const [titleModal,setTitleModal] = useState("");

    const [action,setAction] = useState("");
    const [isError, setIsError] = useState(false);
    const [generalMessage, setGeneralMessage] = useState<string>('')
    const [isGeneralModalOpen, setIsGeneralModalOpen] = useState(false)
    const [deleteId, setDeleteId] = useState<number>()
    const [pacientes, setPacientes] = useState<DadosPaciente[]>([])
    const [filtroName, setFiltroName] = useState<string>('')
    const [filtroCPF, setFiltroCPF] = useState<string>('')
    const [loading, setLoading] = useState<boolean>(true);
    const [dadosPaciente, setDadosPaciente] = useState<DadosPaciente>({} as DadosPaciente)
    const [openModalNewPatient, setOpenModalNewPatient] = useState<boolean>(false)
    const [type,setType] = useState<ModalType>(ModalType.newPatient)
    const auth = useAuth()

    const fetchLeads = useCallback(async () => {
        setLoading(true)
        try {
            if(auth.tenantId) {
                const result = await listLeadsByTenant(auth.tenantId)
                if(result?.data.data) {
                    setLoading(false);
                    setPacientes(result?.data.data.leads)
                } else {
                    setLoading(false);
                    setPacientes([])
                }

            }
        } catch(error) {
            setLoading(false);
            setTitle("Erro ao carregar")
            setAction("Fechar")
            setIsError(true)
            setGeneralMessage('Não foi possível carregar a lista de pacientes: ' + error)
            setIsGeneralModalOpen(true)

        }
    }, [auth.tenantId])

    useEffect(() => {

        fetchLeads().then()
    }, [fetchLeads])
    const handleConfirmationBooking = () => {
        openFlexiveModal('Confirmação de Agendamento', ModalType.bookingConfirmation)
    }
    const handleConfirmationDelete = (id: number) => {
        setGeneralMessage("Deseja deletar o lead selecionado?")
        setTitle('Confirmação de Exclusão')
        setAction('Excluir')
        setDeleteId(id)
        setIsGeneralModalOpen(true)

    }
    const formatDate = (date?: string) => {
        if(date) {
            const spliData = new Date(date).toLocaleDateString().split("/");
            return spliData[1] + "/" + spliData[0] + "/" + spliData[2]
        }
    }

    const renderRow = (lead: CreateLeadDTO) => (
        <>
            <TableCell className="text-oxfordBlue font-bold">{lead.name || 'Sem Registro'}</TableCell>
            <TableCell className="text-oxfordBlue">{lead.phoneNumber || 'Sem Registro'}</TableCell>
            <TableCell className="text-oxfordBlue">{lead.canal || 'Sem Registro'}</TableCell>
            <TableCell className="text-oxfordBlue">{lead.contactChannel || 'Sem Registro'}</TableCell>
            <TableCell className="text-oxfordBlue">{lead.scheduled || 'Sem Registro'}</TableCell>
            <TableCell className="text-oxfordBlue">{formatDate(lead.scheduledDate) || 'Sem Registro'}</TableCell>
        </>
    );
    const handleDeletePatient = async () => {
        try {
            if (auth.tenantId && deleteId) {
                setIsGeneralModalOpen(false)
                await deletePatient(deleteId.toString(),auth.tenantId).then(
                    (result) => {
                        if(result.message && result.message.includes('FK_')){
                            handleModalMessage('Não é possível deletar um lead com agendamento ou procedimento realizado')
                            return
                        } else {
                            return result
                        }
                    }
                )
            }

        } catch(error) {
            console.error(error)
        }
    }
    const handleModalMessage = (message: string) => {
        setGeneralMessage(message)
        setTitle('Confirmação')
        setAction('Fechar')
        setIsError(false)
        setIsGeneralModalOpen(true)
    }

    const openFlexiveModal = (title: string, modalType: ModalType, paciente?: DadosPaciente) => {
        if(paciente) {
            setDadosPaciente(paciente)
        }
        setType(modalType)
        setTitleModal(title)
        setOpenModalNewPatient(true)
    }

    const handleClose = () => {
        setIsGeneralModalOpen(false)
        fetchLeads().then()
    }

    if (loading) {
        return <Loading />
    }

    return (
        <div className="w-full p-10 mx-auto">
            <h1 className="text-3xl mb-6 font-bold tracking-tight">Leads</h1>
            <div className="flex flex-col md:flex-row gap-3 mb-6">
                <Cards name='Total de Leads' content={pacientes?.length}/>
            </div>

            <div className="flex flex-col md:flex-row gap-3 mb-5">
                <div className='p-2'>
                    <Label htmlFor="filtroNome" className="text-oxfordBlue">Nome</Label>
                    <Input
                        className="w-72"
                        id="filtroNome"
                        placeholder="Filtrar por nome"
                        value={filtroName}
                        onChange={(e) => setFiltroName(e.target.value)}/>
                </div>
                <div className='p-2'>
                    <Label htmlFor="filtroCPF" className="text-oxfordBlue">CPF</Label>
                    <Input
                        className="w-72"
                        id="filtroCPF"
                        placeholder="Filtrar por CPF"
                        value={filtroCPF}
                        onChange={(e) => setFiltroCPF(e.target.value)}/>
                </div>
            </div>

            <Card>
                <CardContent>
                    {
                        pacientes.length === 0 ?
                            (
                                <div className="p-10">
                                    <NoDataTable message="Não possui leads cadastrados"/>
                                </div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="text-oxfordBlue">Nome</TableHead>
                                            <TableHead className="text-oxfordBlue">Telefone</TableHead>
                                            <TableHead className="text-oxfordBlue">Canal</TableHead>
                                            <TableHead className="text-oxfordBlue">Canal de Contato</TableHead>
                                            <TableHead className="text-oxfordBlue">Agendou</TableHead>
                                            <TableHead className="text-oxfordBlue">Data do Agendamento</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <DataTable renderRow={renderRow} openModalBooking={true} openModalEdit={openFlexiveModal}  deleteData={handleConfirmationDelete} dataTable={pacientes}></DataTable>
                                </Table>
                            )
                    }
                </CardContent>
            </Card>

            {openModalNewPatient && <ModalRender
                modalMessage={handleModalMessage}
                isOpen={openModalNewPatient}
                title={titleModal}
                onClose={() => setOpenModalNewPatient(false)}
                type={type}
                data={dadosPaciente}
                modalNewBookingConfirmation={handleConfirmationBooking}
            />}

            <GeneralModal
                title={title}
                action={action}
                error={isError}
                isOpen={isGeneralModalOpen}
                isDelete={handleDeletePatient}
                onClose={handleClose}
                message={generalMessage}/>
        </div>
    )
}
export default AdminLeads;