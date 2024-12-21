import { Header } from "@/components/patient/Header.tsx";
import { useAuth } from "@/hooks/auth.tsx";
import AdminSidebar from "@/pages/admin/AdminSidebar.tsx";
import React from "react";
import { Outlet } from "react-router-dom";
import {hasAccess} from "@/lib/controlAccessLevel.ts";


const AppLayout: React.FC = () => {
    const auth = useAuth();


    function HandleSideBar() {
        if(hasAccess(auth.role, 'admin')) {
            return <AdminSidebar />
        } else {
            return <Header />
        }
    }

    return (
        <div className="flex h-screen">
            <div>
                <HandleSideBar/>
            </div>
            <div className="flex-1 overflow-y-auto md:ml-64">
                <Outlet/>
            </div>
        </div>
    );
}

export default AppLayout;