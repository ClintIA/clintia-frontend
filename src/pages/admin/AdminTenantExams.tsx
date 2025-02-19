import React, {useCallback, useEffect, useState} from "react";
import Cards from "@/components/Card.tsx";
import {Card, CardContent} from "@/components/ui/card.tsx";
import {Table, TableHead, TableHeader, TableRow} from "@/components/ui/table.tsx";
import DataTable from "@/components/DataTable.tsx";
import {deleteExam, listTenantExam} from "@/services/tenantExamService.tsx";
import {useAuth} from "@/hooks/auth.tsx";
import Loading from "@/components/Loading.tsx";
import {TableCell} from "@mui/material";
import GeneralModal from "@/components/ModalHandle/GeneralModal.tsx";
import {ModalType} from "@/types/ModalType.ts";
import {Button} from "@/components/ui/button.tsx";
import NoDataTable from "@/components/NoDataTable.tsx";
import ModalRender from "@/components/ModalHandle/ModalRender.tsx";

export interface Exams {
    id?: number
    exam_name: string
    exam_type?: string
    price: string
    doctorPrice?: string
    doctors: Doctor[]
    createdAt?: Date
}
export interface Doctor {
    id: number;
    fullName: string
}
const AdminTenantExams: React.FC = () => {

    const [exames, setExames] = useState<Exams[]>([])
    const [exame, setExame] = useState<Exams>()
    const [openModalNewExam, setOpenModalNewExam] = useState<boolean>(false)
    const [loading, setLoading] = useState<boolean>(false);
    const [type,setType] = useState<ModalType>(ModalType.newExam)
    const [deleteId, setDeleteId] = useState<number>()
    const [title,setTitle] = useState("");
    const [titleModal,setTitleModal] = useState("");

    const [action,setAction] = useState("");
    const [isError, setIsError] = useState(false);
    const [generalMessage, setGeneralMessage] = useState<string>('')
    const [isGeneralModalOpen, setIsGeneralModalOpen] = useState(false)

    const auth = useAuth()

    const fetchExams = useCallback(async () => {
        try {
            if(auth.tenantId) {
                setLoading(true)
                await listTenantExam(auth.tenantId).then(
                    (result) => {
                        if(result.status === 200) {
                            setLoading(false)
                            setExames(result.data.data)
                        }
                    }
                ).catch(error => console.log(error))

            }
        } catch (error) {
            console.error(error)
        }
    },[auth.tenantId])

    useEffect( () => {
        fetchExams().then()
    }, [fetchExams, auth.tenantId]);
    const renderRow = (exame: Exams) => (
        <>
            <TableCell className="text-oxfordBlue font-bold">{exame.exam_name}</TableCell>
            <TableCell className="text-oxfordBlue">{ exame.doctors.length > 0 ?
                exame.doctors.map((doctor) => (<p key={doctor.id}>Dr(a). {doctor.fullName}</p>))
                :
                (<p>Não possuí profissional cadastrado</p>)
            }
            </TableCell>
            <TableCell className="text-oxfordBlue capitalize">{exame.exam_type}</TableCell>
            <TableCell className="text-oxfordBlue">R$ {exame.price}</TableCell>
            <TableCell className="text-oxfordBlue capitalize">R$ {exame.doctorPrice}</TableCell>
        </>
    );
    const openFlexiveModal = (title: string, modalType: ModalType, exams?: Exams) => {
        if(exams) {
            setExame(exams)
        }
        setType(modalType)
        setTitleModal(title)
        setOpenModalNewExam(true)
    }
    const handleModalMessage = (message: string) => {
        setGeneralMessage(message)
        setTitle('Confirmação')
        setAction('Fechar')
        setIsError(false)
        setIsGeneralModalOpen(true)
    }
    const handleConfirmationDelete = (id: number) => {
        setGeneralMessage("Deseja deletar o procedimento selecionado?")
        setTitle('Confirmação de Exclusão')
        setAction('Excluir')
        setDeleteId(id)
        setIsGeneralModalOpen(true)

    }
    const deletePatient = async () => {
        try {
            if (auth.tenantId && deleteId) {
                await deleteExam(deleteId,auth.tenantId).then(
                    (result) => {
                        if(result.message && result.message.includes('FK_')){
                            handleModalMessage('Não é possível deletar o procedimento que está relacionado com um profissional')
                            return
                        } else {
                            return fetchExams().then()
                        }
                    }
                )
                setIsGeneralModalOpen(false)
            }

        } catch(error) {
            console.error(error)
        }
    }
    const handleClose = () => {
        setIsGeneralModalOpen(false)
        fetchExams().then()
    }
    if (loading) {
        return <Loading />
    }
    return (
            <div className="w-full p-10 mx-auto">
                <h1 className="text-3xl mb-6 font-bold tracking-tight">Tipos de Procedimentos da Clínica</h1>
                <div className="flex flex-col md:flex-row gap-3 mb-6">
                    <Cards name='Total de Procedimentos' content={exames?.length}/>
                </div>
                <div className="flex justify-items-start ml-2 mb-3">
                    <div>
                        <Button onClick={() => openFlexiveModal('Cadastrar Procedimento',ModalType.newExam)}
                                className="p-4 text-base bg-oxfordBlue text-white hover:bg-blue-900" type="submit">Adicionar
                            Procedimento</Button>
                    </div>
                </div>
                <Card>
                    <CardContent>
                        {
                            exames.length === 0 ?
                                (
                                    <div className="p-10">
                                        <NoDataTable message="Não possui procedimentos cadastrados"/>
                                    </div>
                                ) : (
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="text-oxfordBlue">Nome do Procedimento</TableHead>
                                                <TableHead className="text-oxfordBlue">Profissionais</TableHead>
                                                <TableHead className="text-oxfordBlue">Tipo do Procedimento</TableHead>
                                                <TableHead className="text-oxfordBlue">Preço do Procedimento</TableHead>
                                                <TableHead className="text-oxfordBlue">Valor do Profissional</TableHead>
                                                <TableHead className="text-oxfordBlue">Ação</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <DataTable openModalEdit={openFlexiveModal} openModalBooking={false}
                                                   deleteData={handleConfirmationDelete} dataTable={exames}
                                                   renderRow={renderRow}></DataTable>
                                    </Table>
                                )
                        }
                    </CardContent>
                </Card>
                {openModalNewExam && <ModalRender
                    modalMessage={handleModalMessage}
                    isOpen={openModalNewExam}
                    title={titleModal}
                    onClose={() => setOpenModalNewExam(false)}
                    type={type}
                    data={exame}
                />}
                <GeneralModal
                    title={title}
                    action={action}
                    error={isError}
                    isOpen={isGeneralModalOpen}
                    isDelete={deletePatient}
                    onClose={handleClose}
                    message={generalMessage}/>
            </div>
    )
}

export default AdminTenantExams;