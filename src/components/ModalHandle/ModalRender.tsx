import React, {useEffect, useState} from 'react'
import RegisterPatient, {DadosPaciente} from "@/components/AdminPatient/RegisterPatient.tsx";
import {registerPatient} from "@/services/loginService.tsx";
import RegisterBooking, {DadosBooking} from "@/components/AdminBooking/RegisterBooking.tsx";
import ModalFlexivel from "@/components/ModalHandle/ModalFlexivel.tsx";
import { registerPatientExam} from "@/services/patientExamService.tsx";
import {updatePatient} from "@/services/patientService.tsx";
import RegisterBookingAndPatient from "@/components/AdminBooking/RegisterBookingAndPatient.tsx";
import BookingConfirmation, {BookingConfirmationState} from "@/components/AdminBooking/BookingConfirmation.tsx";
import {ModalType} from "@/types/ModalType.ts";
import RegisterAdmin from "@/components/AdminRegister/RegisterAdmin.tsx";
import RegisterDoctor, {IDoctor} from "@/components/AdminDoctor/RegisterDoctor.tsx";
import {IAdmin} from "@/types/dto/Admin.ts";
import {registerDoctor, updateDoctor} from "@/services/doctorService.ts";
import RegisterTenantExam from "@/components/AdminTenantExam/RegisterTenantExam.tsx";
import {IMarketing} from "@/types/Marketing.ts";
import {Exams} from "@/pages/admin/AdminTenantExams.tsx";
import {CreateLeadDTO} from "@/types/dto/CreateLead.ts";


interface ModalRegisterProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    modalNewBookingConfirmation?: (message: string) => void;
    modalMessage?: (message: string) => void;
    data?: IAdmin | IDoctor | IMarketing | Exams | DadosPaciente | CreateLeadDTO
    type: ModalType
    isDoctor?: boolean
    isStepper?: boolean
    totalBudget?: number

}


const ModalRender: React.FC<ModalRegisterProps> = ({ isStepper = false,isOpen, onClose, title,modalMessage, modalNewBookingConfirmation, type, data }: ModalRegisterProps) => {
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

    const openModal = (type: ModalType, patientData?: BookingConfirmationState) => {
        if(patientData) {
            setPatientData(patientData)
        }
        setModalContent(type)
        setOpen(true)
    }

    const handleClose = () => {
        setOpen(false)
        onClose()
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
                return(<RegisterBookingAndPatient title={title} setStep={setStep} handleModalMessage={openModal} />)
            case 'bookingConfirmation':
                return(<BookingConfirmation setStep={setStep} dadosBooking={patientData} onNewBooking={openModal} />)
            case 'newDoctorAdmin':
                return(<RegisterDoctor title={title} isDoctor={submitNewDoctor} />)
            case 'editDoctorAdmin':
                return(<RegisterDoctor title={title} dadosIniciais={data} isUpdate={submitUpdateDoctor} />)
            case 'newAdmin':
                return(<RegisterAdmin title={title} />)
            case 'editAdmin':
                return(<RegisterAdmin title={title} dadosIniciais={data} />)
            case 'editExam':
                return (<RegisterTenantExam title={title} dadosIniciais={data} />)
            case 'newExam':
                return(<RegisterTenantExam title={title}/>)
        }
    }
    return (
            <ModalFlexivel
                isOpen={open}
                isStepper={isStepper}
                currentStep={currentStep}
                onClose={handleClose}
                title="Agendamento">
                {renderModalContent()}
            </ModalFlexivel>
    )
}
export default ModalRender;