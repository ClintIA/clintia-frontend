export interface CreateLeadDTO {
    id?: number
    name: string;
    phoneNumber: string;
    canal: string;
    indication_name?: string;
    contactChannel?: string;
    diagnosis?: string;
    scheduled?: boolean;
    scheduledDate?: string;
    scheduledDoctorId?: number;
    examId?: number;
}