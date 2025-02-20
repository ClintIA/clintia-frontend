import React, {useEffect, useState} from 'react'
import RegisterPatient, {DadosPaciente} from "@/components/AdminPatient/RegisterPatient.tsx";
import {registerPatient} from "@/services/loginService.tsx";
import RegisterBooking, {DadosBooking} from "@/components/AdminBooking/RegisterBooking.tsx";
import ModalFlexivel from "@/components/ModalHandle/ModalFlexivel.tsx";
import {registerBookingWithPatient, registerPatientExam} from "@/services/patientExamService.tsx";
import {updatePatient} from "@/services/patientService.tsx";
import RegisterBookingAndPatient, {BookingWithPatient} from "@/components/AdminBooking/RegisterBookingAndPatient.tsx";
import BookingConfirmation, {BookingConfirmationState} from "@/components/AdminBooking/BookingConfirmation.tsx";
import {ModalType} from "@/types/ModalType.ts";
import {registerAdmin, updateAdmin} from "@/services/adminsService.tsx";
import RegisterAdmin from "@/components/AdminRegister/RegisterAdmin.tsx";
import RegisterDoctor, {IDoctor} from "@/components/AdminDoctor/RegisterDoctor.tsx";
import {IAdmin} from "@/types/dto/Admin.ts";
import {registerDoctor, updateDoctor} from "@/services/doctorService.ts";
import {createExam, updateExam} from "@/services/tenantExamService.tsx";
import RegisterTenantExam, {IExam} from "@/components/AdminTenantExam/RegisterTenantExam.tsx";
import {Exams} from "@/pages/admin/AdminTenantExams.tsx";
import LeadRegister, {LeadRegisterDTO} from "@/components/AdminLeadRegister/LeadRegister.tsx";
import {createRegisterLead} from "@/services/leadRegisterService.ts";
import {IMarketing} from "@/types/Marketing.ts";


interface ModalRegisterProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    modalNewBookingConfirmation?: (message: string) => void;
    modalMessage?: (message: string) => void;
    data?: IAdmin | IDoctor | IMarketing | Exams | DadosPaciente
    type: ModalType
    isDoctor?: boolean
    isStepper?: boolean
    totalBudget?: number

}


const ModalRender: React.FC<ModalRegisterProps> = ({ isStepper = false,isOpen, onClose, title,modalMessage,modalNewBookingConfirmation, type, data }: ModalRegisterProps) => {
    const [open, setOpen] = useState(isOpen)
    const [modalContent,setModalContent] = useState<ModalType>(ModalType.newPatient)
    const [patientData, setPatientData] = useState<BookingConfirmationState>({} as BookingConfirmationState)
    const [currentStep, setCurrentStep] = useState(0)

    const setStep = (step: number) => {
        setCurrentStep(step)
    }
        useEffect(() => {
        openModal(type)
    }, [type])

    const openModal = (type: ModalType) => {
        setModalContent(type)
        setOpen(true)
    }

    const handleClose = () => {
        setOpen(false)
        onClose()
    }
    const submitBookingExam = async (bookingDados: DadosBooking, tenantId: number, patientData?: DadosPaciente) => {
        try {
            if (modalNewBookingConfirmation) {
                if(patientData) {
                   await updatePatient(patientData, tenantId)
                }
            const result = await registerPatientExam(bookingDados, tenantId)
                setPatientData(result.data.data.data)
                modalNewBookingConfirmation('Paciente Agendado com sucesso')
                return result
            }

        } catch (error) {
            console.log(error)
        }
    }

    const submitBookintWithPatient = async (bookingDataWithPatient: BookingWithPatient, tenantId: number) => {
        try {
            if (modalNewBookingConfirmation) {
                const result = await registerBookingWithPatient(bookingDataWithPatient, tenantId)
                setPatientData(result.data.data.data)
                modalNewBookingConfirmation('Paciente Agendado com sucesso')
                return result
            }
        } catch (error) {
            console.log(error)
        }
    }
    const submitUpdatePatient = async (dadosPaciente: DadosPaciente, tenantId: number) => {
        if (modalMessage) {
            await updatePatient(dadosPaciente, tenantId)
                .then(result => {
                    if (result.data.status === "success") {
                        modalMessage('Paciente Atualizado com sucesso')
                        onClose()
                    } else {
                        throw new Error('Não foi possível atualizar paciente' + result.message)
                    }
                }).catch(error => {console.log(error)})
        }
    }
    const submitNewPatient = async (patientData: DadosPaciente, tenantId: number) => {
            if (modalMessage) {
              return await registerPatient(patientData, tenantId)
                    .then(
                        (result) => {
                            if (result.status === 201) {
                                modalMessage('Paciente cadastrado com sucesso')
                                onClose()
                            } else {
                                throw new Error('Não foi possível cadastrar paciente' + result.message)
                            }
                        }
                    ).catch(error => console.log(error))
            }
    }
    const submitNewLead = async (leadRegister: LeadRegisterDTO, tenantId: number) => {
        if (modalMessage) {
            return await createRegisterLead(leadRegister, tenantId)
                .then(
                    (result) => {
                        if (result.status === 200) {
                            modalMessage('Lead Registrado com sucesso')
                            onClose()
                        } else {
                            throw new Error('Não foi possível cadastrar paciente' + result.message)
                        }
                    }
                ).catch(error => console.log(error))
        }
    }
    const submitNewAdmin = async (adminData: IAdmin,tenantId: number) => {
        if(modalMessage) {
            const result = await registerAdmin(adminData,tenantId)

            if (result.status === 201) {
                modalMessage('Cadastrado Realizado com sucesso')
                onClose()
            } else {
                throw new Error('Não foi possível realizar cadastro: ' + result.message)
            }
        }
    }
    const submitUpdateAdmin = async (adminData: IAdmin,tenantId: number) => {
        if (modalMessage) {
            await updateAdmin(adminData,tenantId)
                .then(result => {
                    if (result.status === 200) {
                        modalMessage('Dados Atualizados com sucesso')
                        onClose()
                    } else {
                        throw new Error('Não foi possível atualizar dados' + result.message)
                    }
                }).catch(error => {console.log(error)})
        }
    }
    const submitNewDoctor = async (doctorData: IDoctor,tenantId: number) => {
        if(modalMessage) {
           const result = await registerDoctor(doctorData, tenantId)
            if (result.status === 201) {
                modalMessage('Cadastrado Realizado com sucesso')
                onClose()
            } else {
                throw new Error('Não foi possível realizar cadastro: ' + result.message)
            }
        }
    }
    const submitUpdateDoctor = async (doctorData: IDoctor,tenantId: number) => {
        if(modalMessage) {
            const result = await updateDoctor(doctorData,tenantId)
            if (result.status === 200) {
                modalMessage('Cadastrado atualizado com sucesso')
                onClose()
            } else {
                throw new Error('Não foi possível atualizar cadastro: ' + result.message)
            }
        }
    }
    const submitNewExam = async (examData: IExam, tenantId: number) => {
        if(modalMessage) {
            const result =  await createExam(examData, tenantId)
            modalMessage('Procedimento cadastrado com sucesso')
            return result
        }
    }
    const submitUpdateExam = async (examData: IExam, tenantId: number) => {
        if (modalMessage) {
            await updateExam(examData, tenantId)
                .then((result) => {
                    if (result.data.status === "success") {
                        modalMessage('Procedimento Atualizado com sucesso')
                        onClose()
                    } else {
                        return new Error('Não foi possível atualizar exame' + result.message)
                    }
                }).catch(error => {console.log(error)})
        }
    }
    const renderModalContent = () => {
        switch (modalContent) {
            case 'booking':
                return (<RegisterBooking title={title} setStep={setStep} handleModalMessage={openModal} onClose={handleClose} dadosPaciente={data} isNewBooking={submitBookingExam} />)
            case 'newPatient':
                return(<RegisterPatient title={title} isNewPatient={submitNewPatient}/>)
            case 'editPatient':
                return(<RegisterPatient title={title} dadosIniciais={data} isUpdate={submitUpdatePatient} />
                )
            case 'newBookingPatient':
                return(<RegisterBookingAndPatient title={title} setStep={setStep} submitBooking={submitBookingExam} submitBookingWithPatient={submitBookintWithPatient} handleModalMessage={openModal} />)
            case 'bookingConfirmation':
                return(<BookingConfirmation setStep={setStep} dadosBooking={patientData} onNewBooking={openModal} />)
            case 'newDoctorAdmin':
                return(<RegisterDoctor title={title} isDoctor={submitNewDoctor} />)
            case 'editDoctorAdmin':
                return(<RegisterDoctor title={title} dadosIniciais={data} isUpdate={submitUpdateDoctor} />)
            case 'newAdmin':
                return(<RegisterAdmin title={title} isAdmin={submitNewAdmin} />)
            case 'editAdmin':
                return(<RegisterAdmin title={title} dadosIniciais={data} isUpdate={submitUpdateAdmin} />)
            case 'editExam':
                return (<RegisterTenantExam title={title} isUpdate={submitUpdateExam} dadosIniciais={data} />)
            case 'newExam':
                return(<RegisterTenantExam title={title} isNewExam={submitNewExam}/>)
            case 'newLead':
                return(<LeadRegister title={title} newLead={submitNewLead}/>)
        }
    }
    return (
            <ModalFlexivel
                isOpen={open}
                isStepper={isStepper}
                currentStep={currentStep}
                onClose={handleClose}
                title="Gerenciamento">
                {renderModalContent()}
            </ModalFlexivel>
    )
}
export default ModalRender;