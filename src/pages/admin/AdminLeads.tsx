import React, {useCallback, useEffect, useState} from 'react'
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card.tsx"
import {Table, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table.tsx"
import Cards from "@/components/Card.tsx";
import {useAuth} from "@/hooks/auth.tsx";
import Loading from "@/components/Loading.tsx";
import ModalRender from "@/components/ModalHandle/ModalRender.tsx";
import DataTable from "@/components/DataTable.tsx";
import GeneralModal from "@/components/ModalHandle/GeneralModal.tsx";
import {ModalType} from "@/types/ModalType.ts";
import NoDataTable from "@/components/NoDataTable.tsx";
import {deleteLead, listLeadsByTenant} from "@/services/leadService.tsx";
import {CreateLeadDTO} from "@/types/dto/CreateLead.ts";
import {listCanalMarketing} from "@/services/marketingService.ts";
import {IMarketing} from "@/types/Marketing.ts";
import {format} from "date-fns";
import {ptBR} from "date-fns/locale";
import {LeadDateFilter} from "@/components/AdminBooking/LeadDateFilter.tsx";
import {Pagination} from "@/components/Pagination.tsx";
import {days, months} from "@/lib/optionsFixed.ts";
import {Button} from "@/components/ui/button.tsx";
import {Download} from "lucide-react";
import {exportLeadsToCSV} from "@/components/serverExportCsv.tsx";

const AdminLeads: React.FC = () => {

    const [title,setTitle] = useState("");
    const [titleModal,setTitleModal] = useState("");

    const [action,setAction] = useState("");
    const [isError, setIsError] = useState(false);
    const [generalMessage, setGeneralMessage] = useState<string>('')
    const [isGeneralModalOpen, setIsGeneralModalOpen] = useState(false)
    const [deleteId, setDeleteId] = useState<number>()
    const [pacientes, setPacientes] = useState<CreateLeadDTO[]>([])
    const [dateFilters, setDateFilters] = useState<{
        day?: number
        month?: number
        year?: number
    }>({
        day: new Date().getDate(),
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear()
    })
    const [loading, setLoading] = useState<boolean>(true);
    const [leadData, setLeadData] = useState<CreateLeadDTO>({} as CreateLeadDTO)
    const [openModalNewPatient, setOpenModalNewPatient] = useState<boolean>(false)
    const [type,setType] = useState<ModalType>(ModalType.newPatient)
    const [canal, setCanal] = useState<IMarketing[]>([])
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10); // Você pode ajustar este número
    const auth = useAuth()
    const getCurrentPageItems = () => {
        const indexOfLastItem = currentPage * itemsPerPage;
        const indexOfFirstItem = indexOfLastItem - itemsPerPage;
        return pacientes.slice(indexOfFirstItem, indexOfLastItem);
    };
    const fetchLeads = useCallback(async (date?: { day?: number; month?: number; year?: number }) => {
        setLoading(true)
        try {

            if(auth.tenantId) {
                const result = await listLeadsByTenant(date, auth.tenantId)
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

        fetchLeads(dateFilters).then()
    }, [])

    const handleDate = (date: { day?: number; month?: number; year?: number }) => {
        fetchLeads(date).then()
        setDateFilters(date)
    }
    const exportToCSV = async () => {
        const indexOfLastItem = currentPage * itemsPerPage;
        const indexOfFirstItem = indexOfLastItem - itemsPerPage;
        const filteredPacientes: CreateLeadDTO[] = pacientes.slice(indexOfFirstItem, indexOfLastItem);
        const exportData = filteredPacientes.map((lead) => ({
            Nome: lead.name || 'Sem Registro',
            Telefone: lead.phoneNumber || 'Sem Registro',
            Canal: canal.find(item => item.id == Number(lead.canal))?.canal || 'Sem Registro',
            "Data do Contato": lead.callDate ? format(lead.callDate, "dd/MM/yyyy", {locale: ptBR}) : 'Sem Registro',
            ["Indicação"]: lead.indication_name || 'Sem Registro',
            "Canal de Contato": lead.contactChannel === "phone" ? "Telefone" : "Whatsapp",
            Agendamento: lead.scheduledDate ? format(lead.scheduledDate, "dd/MM/yyyy", {locale: ptBR}) : 'Sem Registro',
            ["Médico Agendado"]: lead.scheduledDoctor?.fullName || 'Sem Registro',
            "Exame Agendado": lead.exam?.exam_name || 'Sem Registro',
            ["Diagnóstico"]: lead.diagnosis || 'Sem Registro',
            ["Observação"]: lead.observation || 'Sem Registro'
        }))
        await exportLeadsToCSV(exportData)
    }
    const handleConfirmationDelete = (id: number) => {
        setGeneralMessage("Deseja deletar o lead selecionado?")
        setTitle('Confirmação de Exclusão')
        setAction('Excluir')
        setDeleteId(id)
        setIsGeneralModalOpen(true)
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

    const renderRow = (lead: CreateLeadDTO) => (
        <>
            <TableCell className="text-oxfordBlue font-bold">{lead.name || 'Sem Registro'}</TableCell>
            <TableCell className="text-oxfordBlue">{lead.phoneNumber || 'Sem Registro'}</TableCell>
            <TableCell className="text-oxfordBlue">{lead.callDate  ? format(lead.callDate, "dd/MM/yyyy", {locale: ptBR}) : 'Sem Registro'}</TableCell>
            <TableCell className="text-oxfordBlue">{canal.map((item) => (
                <span key={item.id}>
                    {(item.id === Number(lead.canal)) ? item.canal : <></>}
                </span>
            ))}</TableCell>
            <TableCell className="text-oxfordBlue capitalize">{lead.indication_name || 'Sem Registro'}</TableCell>
            <TableCell className="text-oxfordBlue capitalize">{lead.contactChannel || 'Sem Registro'}</TableCell>
            <TableCell className="text-oxfordBlue">{lead.scheduledDate ? format(lead.scheduledDate, "dd/MM/yyyy HH:mm", {locale: ptBR}) : 'Sem Registro'}</TableCell>
            <TableCell className="text-oxfordBlue capitalize">{lead.scheduledDoctor?.fullName || 'Sem Registro'}</TableCell>
            <TableCell className="text-oxfordBlue capitalize">{lead.exam?.exam_name || 'Sem Registro'}</TableCell>
            <TableCell className="text-oxfordBlue capitalize">{lead.diagnosis || 'Sem Registro'}</TableCell>
            <TableCell className="text-oxfordBlue capitalize">{lead.observation || 'Sem Registro'}</TableCell>

        </>
    );

    const handleDeletePatient = async () => {
        try {
            if (auth.tenantId && deleteId) {
                setIsGeneralModalOpen(false)
                await deleteLead(deleteId.toString(),auth.tenantId).then(
                    (result) => {
                        if(result.message && result.message.includes('FK_')){
                            handleModalMessage('Não é possível deletar um lead com agendamento ou procedimento realizado')
                            return
                        } else {
                            fetchLeads().then()
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

    const openFlexiveModal = (title: string, modalType: ModalType, lead?: CreateLeadDTO) => {
        if(lead) {
            setLeadData(lead)
        }
        setType(modalType)
        setTitleModal(title)
        setOpenModalNewPatient(true)
    }

    const handleClose = () => {
        setIsGeneralModalOpen(false)
        fetchLeads().then()
    }
    useEffect(() => {
        setCurrentPage(1);
    }, [dateFilters]);

    if (loading) {
        return <Loading />
    }

    return (
        <div className="w-full p-10 mx-auto">
            <h1 className="text-3xl mb-6 font-bold tracking-tight">Leads</h1>
            <div className="flex flex-col md:flex-row gap-3 mb-6">
                <Cards name='Total de Leads' content={pacientes?.length}/>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex flex-col space-y-4">
                        <div>
                            <LeadDateFilter selectedDate={dateFilters.day} onFilterChange={handleDate} selectedMonth={dateFilters.month} selectedYear={dateFilters.year}/>

                        </div>
                       <div>
                           <Button onClick={exportToCSV} disabled={pacientes.length === 0 || loading} className="flex items-center gap-2">
                               <Download className="h-4 w-4" />
                               Exportar Excel
                           </Button>
                       </div>
                    </div>

                </CardHeader>
                <CardContent>
                    {
                        pacientes.length === 0 ? (
                            <div className="p-10">
                                <NoDataTable message="Não possui leads cadastrados"/>
                            </div>
                        ) : (
                            <div>
                                {!dateFilters.day && !dateFilters.month && !dateFilters.year ||
                                    (<CardTitle className="text-oxfordBlue text-xl p-4">
                                        {`
                                             Dia: ${
                                            dateFilters.day
                                                ? days.find(item => item.toString() === dateFilters.day?.toString())
                                                : 'Todos'},
                                        Mês: ${
                                            dateFilters.month
                                                ? months.find(item => item.value === dateFilters.month?.toString())?.label
                                                : 'Todos'},
                                            Ano: ${dateFilters.year ?
                                            dateFilters.year : new Date().getFullYear()}`}
                                    </CardTitle>)}
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="text-oxfordBlue">Nome</TableHead>
                                            <TableHead className="text-oxfordBlue">Telefone</TableHead>
                                            <TableHead className="text-oxfordBlue">Dia da Ligação</TableHead>
                                            <TableHead className="text-oxfordBlue">Canal</TableHead>
                                            <TableHead className="text-oxfordBlue">Indicação</TableHead>
                                            <TableHead className="text-oxfordBlue">Canal de Contato</TableHead>
                                            <TableHead className="text-oxfordBlue">Data do Agendamento</TableHead>
                                            <TableHead className="text-oxfordBlue">Médico Agendado</TableHead>
                                            <TableHead className="text-oxfordBlue">Exame Agendado</TableHead>
                                            <TableHead className="text-oxfordBlue">Diagnóstico</TableHead>
                                            <TableHead className="text-oxfordBlue">Observações</TableHead>

                                        </TableRow>
                                    </TableHeader>
                                    <DataTable
                                        renderRow={renderRow}
                                        openModalBooking={true}
                                        openModalEdit={openFlexiveModal}
                                        deleteData={handleConfirmationDelete}
                                        dataTable={getCurrentPageItems()} // Use os itens da página atual
                                    />
                                </Table>

                                <Pagination
                                    totalItems={pacientes.length}
                                    itemsPerPage={itemsPerPage}
                                    currentPage={currentPage}
                                    onPageChange={(page) => setCurrentPage(page)}
                                />
                            </div>
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
                data={leadData}
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