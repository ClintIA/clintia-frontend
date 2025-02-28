import {createBrowserRouter, Navigate} from "react-router-dom";
import AppLayout from "@/pages/AppLayout.tsx";
import AdminBooking from "@/pages/admin/AdminBooking.tsx";
import AdminDashboard from "@/pages/admin/AdminDashboard.tsx";
import AdminDoctor from "@/pages/admin/AdminDoctor.tsx";
import AdminExams from "@/pages/admin/AdminExams.tsx";
import AdminHome from "@/pages/admin/AdminHome.tsx";
import AdminList from "@/pages/admin/AdminList.tsx";
import AdminPatient from "@/pages/admin/AdminPatient.tsx";
import AdminTenantExams from "@/pages/admin/AdminTenantExams.tsx";
import {DadosCadastrais} from "@/pages/patient/DadosCadastrais";
import {Exames} from "@/pages/patient/Exames.tsx";
import Error401 from "../error/Error401.tsx";
import Error404 from "../error/Error404.tsx";
import {ProtectedRoute} from "@/routes/ProtectedRoute/ProtectedRoute.tsx";
import Login from "@/pages/auth/Login.tsx";
import {ProfileRole} from "@/types/ProfileRole.ts";
import AdminManageMarketing from "@/pages/admin/AdminManageMarketing.tsx";
import {PublicRoute} from "./PublicRoute/PublicRoute.tsx";
import { AuthRedirect } from "./AuthRedirect/AuthRedirect.tsx";
import AdminProfile from "@/pages/admin/AdminProfile.tsx";
import AdminSelectTenant from "@/components/AdminSelectTenant/AdminSelectTenant.tsx";
import AdminLeads from "@/pages/admin/AdminLeads.tsx";

export const router = createBrowserRouter([
    {
        path: "/",
        element: <AuthRedirect />
    },
    {
        path: "*/*",
        element: <Error404 />
    },
    {
        path: "/error-401",
        element: <Error401 />,
    },
    {
        path: "/error-404",
        element: <Error404 />,
    },
    {
        path: "/login",
        element:        
            <PublicRoute>
                <Login />
            </PublicRoute>,
    },
    {
        path:'select-tenant',
        element:
            <PublicRoute>
            <AdminSelectTenant />
            </PublicRoute>
    },
    {
        path: "/paciente",
        element: (<ProtectedRoute role={ProfileRole.patient}><AppLayout /> </ProtectedRoute>),
        errorElement: <Error404 />,
        children: [
            {
                index: true,
                element: <Navigate replace to={'home'} />
            },
            {
                path:'home',
                element:(<ProtectedRoute role={ProfileRole.patient}><Exames /> </ProtectedRoute>),
            },
            {
                path:'dadoscadastrais',
                element:(<ProtectedRoute role={ProfileRole.patient}><DadosCadastrais /> </ProtectedRoute>),
            },
        ]
    },
    {
        path: "/admin",
        element:  (<ProtectedRoute role={ProfileRole.default}><AppLayout /> </ProtectedRoute>),
        errorElement: <Error404 />,
        children: [
            {
                index: true,
                element: <Navigate replace to={'home'} />
            },
            {
                path:'home',
                element:(<ProtectedRoute role={ProfileRole.default}> <AdminHome /> </ProtectedRoute>),
            },
            {
                path:'profile',
                element:(<ProtectedRoute role={ProfileRole.default}> <AdminProfile /> </ProtectedRoute>),
            },
            {
                path:'agendamento',
                element:(<ProtectedRoute  role={ProfileRole.default}> <AdminBooking /> </ProtectedRoute>),
            },
            {
                path:'registrar-pacientes',
                element:(<ProtectedRoute  role={ProfileRole.default}> <AdminPatient /> </ProtectedRoute>),
            },
            {
                path:'leads',
                element:(<ProtectedRoute  role={ProfileRole.default}> <AdminLeads /> </ProtectedRoute>),
            },
            {
                path:'upload-exames',
                element:(<ProtectedRoute  role={ProfileRole.doctor}> <AdminExams /> </ProtectedRoute>),
            },
            {
                path:'registrar-exames',
                element:(<ProtectedRoute  role={ProfileRole.admin}> <AdminTenantExams /> </ProtectedRoute>),
            },
            {
                path:'registrar-medicos',
                element:(<ProtectedRoute  role={ProfileRole.admin}> <AdminDoctor /> </ProtectedRoute>),
            },
            {
                path:'registrar-admin',
                element:(<ProtectedRoute  role={ProfileRole.admin}> <AdminList /> </ProtectedRoute>),
            },
            {
                path: 'dashboard',
                element: (<ProtectedRoute  role={ProfileRole.marketing}> <AdminDashboard /> </ProtectedRoute>),
            }
            ,
            {
                path: 'gestao',
                element: (<ProtectedRoute  role={ProfileRole.marketing}> <AdminManageMarketing /> </ProtectedRoute>),
            }
        ]
    },
]);