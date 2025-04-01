import {DadosBooking} from "@/components/AdminBooking/RegisterBooking.tsx";
import apiClient from "@/lib/interceptor.ts";
import {isAxiosError} from 'axios';
import {BookingWithPatient} from "@/components/AdminBooking/RegisterBookingAndPatient.tsx";

interface ListPatientExamsFilters {
    startDate?: string
    endDate?: string
    patientCpf?: string
    status?: string
    patientName?: string
}

export const registerPatientExam = async (dadosBooking: DadosBooking, tenantId: number | undefined) => {

    try {
        return await apiClient.post('admin/patientExams', dadosBooking, {
            headers: {
                'x-tenant-id': tenantId
            }
        })
    } catch (error) {
        if(isAxiosError(error)) {
            return error.response?.data
        }
    }
}
export const registerBookingWithPatient = async (bookingDataWithPatient: BookingWithPatient, tenantId: number) => {

    try {
        return await apiClient.post('admin/patientExams/newpatient', bookingDataWithPatient, {
            headers: {
                'x-tenant-id': tenantId
            }
        })
    } catch (error) {
        if(isAxiosError(error)) {
            return error.response?.data
        }
    }
}

export const listPatientExams = async (tenantId: number, filters: ListPatientExamsFilters)=> {
    try {
        return await apiClient.get('admin/patientExams', {
            headers: {
                'x-tenant-id': tenantId
            },
            params: filters
        })
    } catch (error) {
        if(isAxiosError(error)) {
            return error.response?.data
        }
    }
}

export const updatePatientExam = async (tenantId: number, examId: number, data: { status: string, link: string }) => {
    try {
        return await apiClient.put(`admin/patientExams/${examId}`, data, {
            headers: {
                'x-tenant-id': tenantId
            }
        })
    } catch (error) {
        if(isAxiosError(error)) {
            return error.response?.data
        }
    }
}

export const confirmPatientExam = async (tenantId: number, examId: number, presence: null | 'Yes' | 'No') => {
    try {
        return await apiClient.put(`admin/patientexams/attendance/${examId}`, {
            attended: presence
        }, {
            headers: {
                'x-tenant-id': tenantId
            }
        })
    } catch (error) {
        if(isAxiosError(error)) {
            return error.response?.data
        }
    }
}

export const deletePatientExam = async (tenantId: number, patientExamId: number) => {
    try {
        return await apiClient.delete(`admin/patientexams/${patientExamId}`, {
            headers: {
                'x-tenant-id': tenantId
            }
        })
    } catch (error) {
        if(isAxiosError(error)) {
            return error.response?.data
        }
    }
}