/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import {TableBody, TableCell, TableRow} from "@/components/ui/table.tsx";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover.tsx";
import {Calendar, MoreHorizontal, Pencil, Trash2} from "lucide-react";
import {Button} from "@/components/ui/button.tsx";
import {ModalType} from "@/types/ModalType.ts";

interface TableProps<T> {
    dataTable?: any[];
    openModalEdit: (title: string, type: ModalType, data: T) => void;
    deleteData: (id: number) => void;
    openModalBooking?: boolean;
    renderRow: (data: any) => React.ReactNode;
}

const DataTable = <T,>({ dataTable, openModalEdit, deleteData, openModalBooking, renderRow }: TableProps<T>) => {

    return (
        <TableBody>
            {dataTable?.map((data) => (
                <TableRow key={data.id}>
                    {renderRow(data)}
                    {Object.prototype.hasOwnProperty.call(data, 'attended') ? '' : <TableCell className="text-oxfordBlue">
                        {data?.role === 'master' ? (
                            <Button disabled={true} className="w-full bg-oxfordBlue text-white">
                                <span className="text-sm">Master Admin</span>
                            </Button>) :(
                            <Popover>
                                <PopoverTrigger asChild>
                                    <MoreHorizontal className="h-6 w-6"/>
                                </PopoverTrigger>
                                <PopoverContent className="w-32">
                                    <div className="p-1 flex flex-col gap-0.5">
                                        {Object.prototype.hasOwnProperty.call(data, 'dob') && (
                                            <Button onClick={() => openModalEdit('Editar Paciente',ModalType.editPatient, data)}
                                                    className="w-full bg-oxfordBlue text-white">
                                                <Pencil className="mr-1 h-4 w-4"/>
                                                <span className="text-sm">Editar</span>
                                            </Button>)}
                                        {Object.prototype.hasOwnProperty.call(data, 'exam_name') && (
                                            <Button onClick={() => openModalEdit('Editar Exame',ModalType.editExam, data)}
                                                    className="w-full bg-oxfordBlue text-white">
                                                <Pencil className="mr-1 h-4 w-4"/>
                                                <span className="text-sm">Editar</span>
                                            </Button>)}
                                        {Object.prototype.hasOwnProperty.call(data, 'phoneNumber') && (
                                            <Button onClick={() => openModalEdit('Editar LEad',ModalType.newLead, data)}
                                                    className="w-full bg-oxfordBlue text-white">
                                                <Pencil className="mr-1 h-4 w-4"/>
                                                <span className="text-sm">Editar</span>
                                            </Button>)}
                                        {Object.prototype.hasOwnProperty.call(data, 'CRM') ? (
                                            <Button
                                                onClick={() => openModalEdit('Editar Profissional',ModalType.editDoctorAdmin, data)}
                                                className="w-full bg-oxfordBlue text-white"
                                            >
                                                <Pencil className="mr-1 h-4 w-4" />
                                                <span className="text-sm">Editar</span>
                                            </Button>
                                        ) : Object.prototype.hasOwnProperty.call(data, 'fullName') && (
                                            <Button
                                                onClick={() => openModalEdit('Editar Administrador',ModalType.editAdmin, data)}
                                                className="w-full bg-oxfordBlue text-white"
                                            >
                                                <Pencil className="mr-1 h-4 w-4" />
                                                <span className="text-sm">Editar</span>
                                            </Button>
                                        )}
                                        {!Object.prototype.hasOwnProperty.call(data, 'phoneNumber') && openModalBooking && (
                                            <Button onClick={() => openModalEdit('Editar Agendamento',ModalType.booking, data)}
                                                    className="w-full bg-oxfordBlue text-white">
                                                <Calendar className="h-4 w-4"/>
                                                <span className="text-sm">Agendar</span>
                                            </Button>
                                        )}
                                        {!Object.prototype.hasOwnProperty.call(data, 'CRM') && (
                                            <Button
                                                onClick={() => deleteData(data.id)}
                                                className="w-full bg-oxfordBlue text-white"
                                            >
                                                <Trash2 className="mr-1 h-4 w-4" />
                                                <span className="text-sm">Excluir</span>
                                            </Button>
                                        )}
                                    </div>
                                </PopoverContent>
                            </Popover>)}
                    </TableCell>
                    }
                </TableRow>
            ))}
        </TableBody>
    );
};

export default DataTable;
