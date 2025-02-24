import {isAxiosError} from 'axios';
import {ILoginAdmin, ILoginAdminWithTenant} from "@/types/Auth.ts";
import {DadosPaciente} from "@/components/AdminPatient/RegisterPatient.tsx";
import apiClient from "@/lib/interceptor.ts";


export const loginService = async (user: string, password: string): Promise<ILoginAdminWithTenant | undefined> => {
    try {
        const data = {
            login: user,
            password: password
        }
        if(user.includes('@')) {
            data.login = user
        } else {
            data.login = user.replace(/\D/g, '')
        }


        const response = await apiClient.post('auth/login', data);
        return response.data;
    } catch (error) {
        if(isAxiosError(error)) {
            return error.response?.data
        }
    }
};
export const loginServiceWithTenant = async (user: string, tenant: number): Promise<ILoginAdmin | undefined> => {
    try {
        const data = {
            user: user,
            tenantId: tenant
        }
        if(user.includes('@')) {
            data.user = user
        } else {
            data.user = user.replace(/\D/g, '')
        }
        const response = await apiClient.post('auth/select-tenant', data);
        return response.data;
    } catch (error) {
        if(isAxiosError(error)) {
            return error.response?.data
        }
    }
};

export const registerPatient = async (patientData: DadosPaciente, tenantId: number) => {
    let data;
    if(patientData.cpf) {
        data =  {...patientData,
            cpf: patientData.cpf.replace(/\D/g, ''),
            phone: patientData.phone?.replace(/\D/g, ''),
            cep: patientData.cep?.replace(/\D/g, '')
        };
    } else {
        data =  {...patientData,
            phone: patientData.phone?.replace(/\D/g, ''),
        };
    }
    try {
        return await apiClient.post('admin/register/patient', data,{
            headers: {
                'x-tenant-id': tenantId
            }
        })
    } catch (error) {
        if(isAxiosError(error)) {
            return error.response?.data
        }
    }
};