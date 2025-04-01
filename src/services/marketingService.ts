import apiClient from "@/lib/interceptor.ts";
import {isAxiosError} from "axios";
import {IMarketing} from "@/types/Marketing.ts";

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
        month?: number
}
export interface MarketingMetricsResponse {
    status: string;
    message: string;
    data: MarketingMetricsData;
}

export interface MarketingMetricsData {
    CPL: number;
    CAP: number;
    ROAS: number;
        roasPercentage: number;
    averageTicket: number;
    CPC: number;
    LTV: number;
    appointmentRate: number;
    noShowRate: number;
    conversionRate: number;
    funnel: FunnelData;
}

export interface FunnelData {
    clicks: number;
    leads: number;
    appointments: number;
    completed: number;
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
export const findAllMetrics = async(month: string | undefined, tenantID: number) => {
    return await apiClient.get(`admin/marketing/metrics?month=${month}`, {
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
export const countChannel = async(filters: MarketingFilters,tenantID: number) => {
    return await apiClient.get('admin/marketing/countChannel', {
        headers: {
            'x-tenant-id': tenantID
        },
        params: filters
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