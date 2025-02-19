import Cards from "@/components/Card.tsx";
import ModalRender from "@/components/ModalHandle/ModalRender.tsx";
import {Card, CardContent} from "@/components/ui/card.tsx";
import {Table, TableHead, TableHeader, TableRow} from "@/components/ui/table.tsx";
import DataTable from "@/components/DataTable.tsx";
import GeneralModal from "@/components/ModalHandle/GeneralModal.tsx";
import React, {useCallback, useEffect, useState} from "react";
import {useAuth} from "@/hooks/auth.tsx";
import {TableCell} from "@mui/material";
import Loading from "@/components/Loading.tsx";
import {ModalType} from "@/types/ModalType.ts";
import {deleteAdmin, listAdmins} from "@/services/adminsService.tsx";
import {format} from "date-fns";
import {ptBR} from "date-fns/locale";
import {IAdmin} from "@/types/dto/Admin.ts";
import {findRoleOptions} from "@/lib/optionsFixed.ts";
import {Button} from "@/components/ui/button.tsx";
import NoDataTable from "@/components/NoDataTable.tsx";

const AdminList: React.FC = () => {

    const [title,setTitle] = useState("");
    const [titleModal,setTitleModal] = useState("");

    const [action,setAction] = useState("");
    const [isError, setIsError] = useState(false);
    const [generalMessage, setGeneralMessage] = useState<string>('')
    const [isGeneralModalOpen, setIsGeneralModalOpen] = useState(false)
    const [admins,setAdmins] = useState<IAdmin[]>([]);
    const [deleteId, setDeleteId] = useState<number>()
    const [admin, setAdmin] = useState<IAdmin>()
    const [openModalNewAdmin, setOpenModalNewAdmin] = useState<boolean>(false)
    const [type,setType] = useState<ModalType>(ModalType.newPatient)
    const [loading, setLoading] = useState<boolean>(false);
    const auth = useAuth()


    const openFlexiveModal = (title: string, modalType: ModalType, admin?: IAdmin) => {
        if(admin) {
            setAdmin(admin)
        }
        setTitleModal(title)
        setType(modalType)
        setOpenModalNewAdmin(true)
    }

    const fetchAdmins = useCallback(async () => {
        try {
            if (auth.tenantId) {
                setLoading(true)
                const result = await listAdmins(auth.tenantId)
                setLoading(false)
                if (result?.data.status === "success") {
                    const adminsList = result?.data?.data as IAdmin[]
                    setAdmins(adminsList || [])
                }
            }
        } catch (error) {
            console.error(error)
        }
    },[auth.tenantId])
    useEffect(() => {
        fetchAdmins().then()
    }, [fetchAdmins]);

    const handleModalMessage = (message: string) => {
        setGeneralMessage(message)
        setTitle('Confirmação de Ação')
        setAction('Fechar')
        setIsError(false)
        setIsGeneralModalOpen(true)
    }
    const handleConfirmationDelete = (id: number) => {
        setGeneralMessage("Deseja deletar o administrador selecionado?")
        setTitle('Confirmação de Exclusão')
        setAction('Excluir')
        setDeleteId(id)
        setIsGeneralModalOpen(true)

    }
    const handleDeletePatient = async () => {
        try {
            if(deleteId && auth.tenantId) {
            await deleteAdmin(deleteId,auth.tenantId).then(
                    (result) => {
                        if (result.message && result.message.includes('FK_')) {
                            handleModalMessage('Não é possível deletar um administrador com agendamento pendente')
                            return
                        } else {
                            return fetchAdmins().then()
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
        fetchAdmins().then()
    }

    if (loading) {
        return <Loading />
    }
    const renderRow = (admin: IAdmin) => (
        <>
            <TableCell className="text-oxfordBlue font-bold">{admin.fullName}</TableCell>
            <TableCell className="text-oxfordBlue00">{admin.cpf}</TableCell>
            <TableCell className="text-oxfordBlue00">{admin.email}</TableCell>
            <TableCell className="text-oxfordBlue00">{admin.cep ? admin.cep : 'Não possuí CEP cadastrado'}</TableCell>
            <TableCell className="text-oxfordBlue00">{admin.phone}</TableCell>
            <TableCell className="capitalize text-oxfordBlue00">{findRoleOptions(admin.role)}</TableCell>
            <TableCell className="text-oxfordBlue00">{admin.created_at ? format(admin.created_at, "dd/MM/yyyy", { locale: ptBR }) : ''}</TableCell>

        </>
    );

    return (
        <div className="w-full p-10 mx-auto">
            <h1 className="text-3xl mb-6 font-bold tracking-tight">Administradores</h1>
            <div className="flex flex-col md:flex-row gap-3 mb-6">
                <Cards name='Total de Adminstradores' content={admins?.length}/>
            </div>
            <div className="flex justify-items-start ml-2 mb-3">
                <div>
                    <Button onClick={() => openFlexiveModal('Cadastrar Administrador',ModalType.newAdmin)}
                            className="p-4 text-base bg-oxfordBlue text-white hover:bg-blue-900" type="submit">Adicionar
                        Administrador</Button>
                </div>
            </div>
            <Card>
                <CardContent>
                        {
                            admins.length === 0 ?
                                (
                                    <div className="p-10">
                                        <NoDataTable message="Não possui adminstradores cadastrados"/>
                                    </div>
                                ) : (
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="text-oxfordBlue">Nome</TableHead>
                                                <TableHead className="text-oxfordBlue">CPF</TableHead>
                                                <TableHead className="text-oxfordBlue">E-mail</TableHead>
                                                <TableHead className="text-oxfordBlue">CEP</TableHead>
                                                <TableHead className="text-oxfordBlue">Contato</TableHead>
                                                <TableHead className="text-oxfordBlue">Perfil de Acesso</TableHead>
                                                <TableHead className="text-oxfordBlue">Data de Cadastro</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <DataTable renderRow={renderRow} openModalBooking={false} openModalEdit={openFlexiveModal}
                                                   deleteData={handleConfirmationDelete} dataTable={admins}></DataTable>
                                    </Table>
                                )
                        }
                </CardContent>
            </Card>

            {openModalNewAdmin && <ModalRender
                modalMessage={handleModalMessage}
                isOpen={openModalNewAdmin}
                onClose={() => setOpenModalNewAdmin(false)}
                type={type}
                title={titleModal}
                data={admin}
                isDoctor={false}
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

export default AdminList;