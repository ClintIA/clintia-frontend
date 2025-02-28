import {isAxiosError} from 'axios';
import apiClient from "@/lib/interceptor.ts";
import {CreateLeadDTO} from "@/types/dto/CreateLead.ts";

export const listLeadsByTenant = async (tenantId: number) => {

    try {
        return await apiClient.get('admin/leads', {
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
export const createRegisterLead = async (leadRegister: CreateLeadDTO, tenantId:  number) => {

    try {
        return await apiClient.post('/admin/leads', leadRegister , {
            headers: {
                'x-tenant-id': tenantId
            }
        })

    } catch (error) {
        if (isAxiosError(error)) {
            return error.response?.data
        }
    }
}
export const updateLead = async (leadData: CreateLeadDTO, tenantId: number | undefined) => {
    try {
        return await apiClient.put(`admin/leads/${leadData.id}`,leadData,{
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
export const deleteLead = async (leadId: string, tenantId: number) => {
    try {
        return await apiClient.delete(`admin/leads/${leadId}`,{
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