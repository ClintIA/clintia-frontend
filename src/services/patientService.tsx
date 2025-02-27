import {isAxiosError} from 'axios';
import apiClient from "@/lib/interceptor.ts";
import {GetPatientExamsResponse} from '../types/Patient.ts';
import {DadosPaciente} from "@/components/AdminPatient/RegisterPatient.tsx";

export interface PatientFilters {
    patientCpf?: string
    patientName?: string
}
export const getPatientByCpfAndTenant = async (cpf: string, tenantId: number) => {
    const data = {
        cpf: cpf,
    }
    try {
       return await apiClient.get('patient/cpf',{
           headers: {
               'x-patient-id': tenantId
           },
           params: data
       })
    } catch (error) {
        if(isAxiosError(error)) {
            return error.response?.data
        }
    }
}
export const getPatientByPhoneAndTenant = async (cpf: string, tenantId: number) => {
    const data = {
        phone: cpf,
    }
    try {
        return await apiClient.get('patient/phone',{
            headers: {
                'x-patient-id': tenantId
            },
            params: data
        })
    } catch (error) {
        if(isAxiosError(error)) {
            return error.response?.data
        }
    }
}
export const listPatientsByTenant = async (tenantId: number, filters?: PatientFilters) => {

    try {
        return await apiClient.get('admin/patients', {
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

export const updatePatient = async (patientData: DadosPaciente, tenantId: number) => {
    try {
        return await apiClient.put(`admin/patient/${patientData.id}`,patientData,{
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
export const deletePatient = async (patientId: string, tenantId: number) => {
    try {
        return await apiClient.delete(`admin/patient/${patientId}`,{
            headers: {
                'x-tenant-id': tenantId
            }
        })
    }  catch (error) {
        if(isAxiosError(error)) {
            return error.response?.data
        }
    }
}

export const patientExams = async(patientId: number): Promise<GetPatientExamsResponse | undefined> => {
    try{
        return await apiClient.get(`/patientExams`, {
            params: { patientId },

        });

    } catch (error) {
        if(isAxiosError(error)) {
            return error.response?.data
        }
    }
};