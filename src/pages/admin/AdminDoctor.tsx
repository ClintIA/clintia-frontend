import Cards from "@/components/Card.tsx";
import ModalRender from "@/components/ModalHandle/ModalRender.tsx";
import {Card, CardContent} from "@/components/ui/card.tsx";
import {Table, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table.tsx";
import DataTable from "@/components/DataTable.tsx";
import GeneralModal from "@/components/ModalHandle/GeneralModal.tsx";
import React, {useCallback, useEffect, useState} from "react";
import {useAuth} from "@/hooks/auth.tsx";
import Loading from "@/components/Loading.tsx";
import {ModalType} from "@/types/ModalType.ts";
import {format} from "date-fns";
import {ptBR} from "date-fns/locale";
import {IAdmin} from "@/types/dto/Admin.ts";
import {IDoctor} from "@/components/AdminDoctor/RegisterDoctor.tsx";
import {deleteDoctor, listDoctors} from "@/services/doctorService.ts";
import {Button} from "@/components/ui/button.tsx";
import NoDataTable from "@/components/NoDataTable.tsx";

const AdminDoctor: React.FC = () => {

    const [title,setTitle] = useState("");
    const [titleModal,setTitleModal] = useState("");

    const [action,setAction] = useState("");
    const [isError, setIsError] = useState(false);
    const [generalMessage, setGeneralMessage] = useState<string>('')
    const [isGeneralModalOpen, setIsGeneralModalOpen] = useState(false)
    const [doctors,setDoctors] = useState<IDoctor[]>([]);
    const [deleteId, setDeleteId] = useState<number>()
    const [doctor, setDoctor] = useState<IDoctor>()
    const [doctorsPagination, setDoctorsPagination] = useState({ total: 0, page: 1, take: 1000, skip: 0, remaining: 0 })
    const [openModalNewPatient, setOpenModalNewPatient] = useState<boolean>(false)
    const [type,setType] = useState<ModalType>(ModalType.newPatient)
    const [loading, setLoading] = useState<boolean>(false);
    const auth = useAuth()


    const openFlexiveModal = (title: string, modalType: ModalType, doctor?: IDoctor) => {
        if(doctor) {
            setDoctor(doctor)
        }

        setType(modalType)
        setTitleModal(title)
        setOpenModalNewPatient(true)
    }

    const fetchDoctors = useCallback(async () => {
        try {
            if (auth.tenantId) {
                setLoading(true)
                const result = await listDoctors(auth.tenantId, doctorsPagination.take)
                setLoading(false)
                if (result?.data.status === "success") {
                    const doctorsList = result?.data?.data?.data as IAdmin[]
                    setDoctors(doctorsList || [])
                    setDoctorsPagination(result.data?.data?.pagination)
                }
            }
        } catch (error) {
            console.error(error)
        }
    },[auth.tenantId, doctorsPagination.take])
    useEffect(() => {
        fetchDoctors().then()
    }, [fetchDoctors]);

    const handleModalMessage = (message: string) => {
        setGeneralMessage(message)
        setTitle('Confirmação de Ação')
        setAction('Fechar')
        setIsError(false)
        setIsGeneralModalOpen(true)
    }
    const handleConfirmationDelete = (id: number) => {
        setGeneralMessage("Deseja deletar o profissional selecionado?")
        setTitle('Confirmação de Exclusão')
        setAction('Excluir')
        setDeleteId(id)
        setIsGeneralModalOpen(true)

    }
    const handleDeletePatient = async () => {
        try {
            if(deleteId && auth.tenantId) {
            await deleteDoctor(deleteId,auth.tenantId).then(
                    (result) => {
                        if (result.message && result.message.includes('FK_')) {
                            handleModalMessage('Não é possível deletar um profissional com agendamento pendente')
                            return
                        } else {
                            return fetchDoctors().then()
                        }
                    })
                setIsGeneralModalOpen(false)
            }
        } catch(error) {
            console.error(error)
        }
    }
    const handleClose = () => {
        setIsGeneralModalOpen(false)
        fetchDoctors().then()
    }

    if (loading) {
        return <Loading />
    }
    const renderRow = (doctor: IAdmin) => (
        <>
            <TableCell className="text-oxfordBlue font-bold">{doctor.fullName}</TableCell>
            <TableCell className="text-oxfordBlue00">{doctor.cpf}</TableCell>
            <TableCell className="text-oxfordBlue00">{doctor.cep}</TableCell>
            <TableCell className="text-oxfordBlue00">{doctor.email}</TableCell>
            <TableCell className="text-oxfordBlue00">{doctor.phone}</TableCell>
            <TableCell className="text-oxfordBlue00">{doctor.created_at ? format(doctor.created_at, "dd/MM/yyyy", { locale: ptBR }) : ''}</TableCell>

        </>
    );

    return (
        <div className="w-full p-10 mx-auto">
            <h1 className="text-3xl mb-6 font-bold tracking-tight">Profissionais</h1>
            <div className="flex flex-col md:flex-row gap-3 mb-6">
                <Cards name='Total de Profissionais' content={doctors?.length}/>
            </div>
            <div className="flex justify-items-start ml-2 mb-3">
                <div>
                    <Button onClick={() => openFlexiveModal('Cadastrar Profissional', ModalType.newDoctorAdmin)}
                            className="p-4 text-base bg-oxfordBlue text-white hover:bg-blue-900" type="submit">Adicionar
                        Profissional da Saúde</Button>
                </div>
            </div>
            <Card>
                <CardContent>
                    {
                        doctors.length === 0 ?
                            (
                                <div className="p-10">
                                    <NoDataTable message="Não possui profissionais da saúde cadastrados"/>
                                </div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="text-oxfordBlue">Nome</TableHead>
                                            <TableHead className="text-oxfordBlue">CPF</TableHead>
                                            <TableHead className="text-oxfordBlue">CEP</TableHead>
                                            <TableHead className="text-oxfordBlue">Email</TableHead>
                                            <TableHead className="text-oxfordBlue">Contato</TableHead>
                                            <TableHead className="text-oxfordBlue">Data de Cadastro</TableHead>
                                        </TableRow>
                                    </TableHeader>

                                    <DataTable renderRow={renderRow} openModalBooking={false} openModalEdit={openFlexiveModal}
                                               deleteData={handleConfirmationDelete} dataTable={doctors}></DataTable>
                                </Table>
                            )
                    }

                </CardContent>
            </Card>

            {openModalNewPatient && <ModalRender
                modalMessage={handleModalMessage}
                isOpen={openModalNewPatient}
                onClose={() => setOpenModalNewPatient(false)}
                type={type}
                title={titleModal}
                data={doctor}
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

export default AdminDoctor;