import {IExam} from "@/components/AdminTenantExam/RegisterTenantExam.tsx";
import {IDoctor} from "@/components/AdminDoctor/RegisterDoctor.tsx";

export interface CreateLeadDTO {
    id?: number
    name?: string;
    callDate?: Date;
    phoneNumber?: string;
    canal?: string;
    indication_name?: string;
    contactChannel?: string;
    diagnosis?: string;
    observation?: string;
    scheduled?: boolean;
    scheduledDate?: string;
    scheduledDoctorId?: number;
    examId?: number;
    scheduledDoctor?: IDoctor;
    exam?: IExam;
}