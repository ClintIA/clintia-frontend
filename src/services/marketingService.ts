import apiClient from "@/lib/interceptor.ts";
import {IMarketing} from "@/components/AdminMarketing/RegisterCanal.tsx";
import {isAxiosError} from "axios";

export interface MarketingFilters {
        startDate?: string
        endDate?: string
        gender?: string
        patientID?: number
        canal?: string
        status?: 'Scheduled' | 'InProgress' | 'Completed'
        examID?: number
        examType?: string
        attended?: string
        exam_name?: string
}
export const listCanalMarketing = async (tenantID: number) => {
    return await apiClient.get('admin/marketing/canal', {
        headers: {
            'x-tenant-id': tenantID
        }
    })
}
export const getBudgetCanal = async(tenantID: number ) => {
    return await apiClient.get('/admin/marketing/tenantBudget', {
        headers: {
            'x-tenant-id': tenantID
        }
    })
}
export const updateBudgetCanal = async (budget: number,tenantID: number) => {
    return await apiClient.put('/admin/marketing/tenantBudget', {
        budget: budget
    }, {
        headers: {
            'x-tenant-id': tenantID
        }
    })
}
export const registerCanalMarketing = async(canal: IMarketing, tenantID: number) => {
    return await apiClient.post('admin/marketing/canal', canal, {
        headers: {
            'x-tenant-id': tenantID
        }
    })
}
export const updateCanalMarketing = async(canal: IMarketing, tenantID: number) => {
    return await apiClient.post('admin/marketing/data', canal, {
        headers: {
            'x-tenant-id': tenantID
        }
    })
}

export const countPatientWithFilters = async(filters: MarketingFilters,tenantID: number) => {
    return await apiClient.get('admin/marketing/countPatient', {
        headers: {
            'x-tenant-id': tenantID
        },
        params: filters
    })
}
export const countPatientExamWithFilters = async(filters: MarketingFilters,tenantID: number) => {
    return await apiClient.get('admin/marketing/countPatientExam', {
        headers: {
            'x-tenant-id': tenantID
        },
        params: filters
    })
}
export const countChannel = async(tenantID: number) => {
    return await apiClient.get('admin/marketing/countChannel', {
        headers: {
            'x-tenant-id': tenantID
        }
    })
}
export const countTotalInvoice = async (filters: MarketingFilters, tenantID: number) => {
    return await apiClient.get('/admin/marketing/totalInvoice', {
        headers: {
            'x-tenant-id': tenantID
        },
        params: filters
    })
}
export const countTotalInvoiceDoctor = async (filters: MarketingFilters, tenantID: number) => {
    return await apiClient.get('/admin/marketing/totalInvoiceDoctor', {
        headers: {
            'x-tenant-id': tenantID
        },
        params: filters
    })
}
export const deleteCanalMarketing = async (tenantId: number | undefined, canalID: number | undefined) => {
    try {
        return await apiClient.delete(`admin/marketing/canal/${canalID}`, {
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
export const getExamPrice = async (filters: MarketingFilters, tenantID: number) => {
    return await apiClient.get('/admin/marketing/examPrice', {
        headers: {
            'x-tenant-id': tenantID
        },
        params: filters
    })
}