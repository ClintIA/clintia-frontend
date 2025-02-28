import { useAuth } from "@/hooks/auth.tsx";
import {
  Activity, BookUser,
  Calendar,
  ChevronDown,
  ChevronRight, CircleUser, Contact2,
  Home, LayoutDashboard, Lightbulb, LogOut, Microscope,
  MonitorCog, User,
  Users
} from "lucide-react";
import {useNavigate, Link} from "react-router-dom";
import React, {useEffect, useState} from "react";
import {Collapsible, CollapsibleContent, CollapsibleTrigger} from "@radix-ui/react-collapsible";
import clintiaLogo from "@/assets/logoClintia.png";
import {List} from "phosphor-react";
import {hasAccess} from "@/lib/controlAccessLevel.ts";
import {Close} from "@mui/icons-material";


const AdminSidebar: React.FC = () => {


  const [openSections, setOpenSections] = useState<string[]>([]);

  const [menuOpen, setMenuOpen] = useState(false);
  const auth = useAuth();
  const navigate = useNavigate();
  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };


  const toggleSection = (section: string) => {
    setOpenSections(prev =>
        prev.includes(section)
            ? prev.filter(s => s !== section)
            : [...prev, section]
    );
  };
  const isOpen = (section: string) => openSections.includes(section);
  const handleLogout = async () => {
    auth.logOut()
    navigate('/')
  }

  useEffect(() => {
    if (location.pathname.includes('/admin/registrar')) {
      setOpenSections(prev => prev.includes('register') ? prev : [...prev, 'register']);
    }
    if (location.pathname.includes('/admin/dashboard') || location.pathname.includes('/admin/gestao')) {
      setOpenSections(prev => prev.includes('relatorios') ? prev : [...prev, 'relatorios']);
    }
  }, []);
  return (
      <div>
        <div className="md:hidden fixed top-4 right-5 z-50">
          <button
              onClick={toggleMenu}
              className="text-white bg-oxfordBlue p-2 rounded-full shadow-md hover:bg-gray-700 focus:outline-none"
          >
            {!menuOpen ? <List size={32}/> : <Close fontSize={"large"} />}
          </button>
        </div>
        <aside
            className={`bg-oxfordBlue text-white w-64 min-h-screen fixed top-0 left-0 z-50 transition-transform duration-300 ease-in-out ${menuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
          <div className="flex justify-center py-4">
            <img src={clintiaLogo} className="w-32 h-auto md:w-48 md:h-auto" alt="Logo ClintIA"/>
          </div>
          {/* <div className="md:hidden fixed top-4 left-4">
            <button
                onClick={toggleMenu}
                className="text-white bg-oxfordBlue p-2 rounded-full shadow-md hover:bg-gray-700 focus:outline-none"
            >
            </button>
          </div> */}
          <nav className="flex-1 mt-8 px-4 flex flex-col justify-center">
            <ul className="space-y-2">
              <li>
                <Link to="/admin/home" className="flex items-center p-2 rounded-lg hover:bg-gray-700">
                  <Home className="mr-2" size={24}/>
                  <span>Início</span>
                </Link>
              </li>
              <li>
                <Link to="/admin/agendamento" className="flex items-center p-2 rounded-lg hover:bg-gray-700">
                  <Calendar className="mr-2" size={24}/>
                  <span>Agendamentos</span>
                </Link>
              </li>
              <li>
                <Link to="/admin/upload-exames" className="flex items-center p-2 rounded-lg hover:bg-gray-700">
                  <Microscope className="mr-2" size={24}/>
                  <span>Portal de Procedimentos</span>
                </Link>
              </li>
              {hasAccess(auth.role, 'default') && (<li>
                <Collapsible open={isOpen('register')} onOpenChange={() => toggleSection('register')}>
                  <CollapsibleTrigger asChild>
                    <div
                        className="flex w-full p-2 justify-between cursor-pointer hover:bg-gray-700 transition-colors duration-300 rounded-lg">
                      <div className="flex items-center">
                        <MonitorCog className="mr-2" size={24}/>
                        <span>Cadastros</span>
                      </div>
                      {isOpen('register') ? <ChevronDown size={24}/> : <ChevronRight size={24}/>}
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent
                      className={`pl-6 space-y-2 transition-all duration-300 ${isOpen('register') ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'}`}
                  >
                    <Link
                        to="/admin/registrar-pacientes"
                        className="flex items-center p-2 mt-2 mr-2 rounded-lg hover:bg-gray-700"
                    >
                      <Users className="mr-2" size={12}/>
                      <span>Pacientes</span>
                    </Link>
                    <Link
                        to="/admin/leads"
                        className="flex items-center p-2 mt-2 mr-2 rounded-lg hover:bg-gray-700"
                    >
                      <BookUser className="mr-2" size={12}/>
                      <span>Leads</span>
                    </Link>
                    {hasAccess(auth.role, 'admin') && (
                        <>
                          <Link
                              to="/admin/registrar-exames"
                              className="flex items-center p-2 mt-2 mr-2 rounded-lg hover:bg-gray-700"
                          >
                            <Microscope className="mr-2" size={12}/>
                            <span>Procedimentos</span>
                          </Link>
                          <Link
                              to="/admin/registrar-medicos"
                              className="flex items-center p-2 mt-2 mr-2 rounded-lg hover:bg-gray-700"
                          >
                            <Contact2 className="mr-2" size={12}/>
                            <span>Profissionais da Saúde</span>
                          </Link>
                          <Link to="/admin/registrar-admin"
                                className="flex items-center p-2 rounded-lg hover:bg-gray-700">
                            <CircleUser className="mr-2" size={12}/>
                            <span>Administradores</span>
                          </Link>
                        </>
                    )}
                  </CollapsibleContent>
                </Collapsible>
              </li>)}

              {hasAccess(auth.role, 'marketing') && (
                  <li>
                    <Collapsible open={isOpen('relatorios')} onOpenChange={() => toggleSection('relatorios')}>
                      <CollapsibleTrigger asChild>
                        <div
                            className="flex w-full p-2 justify-between cursor-pointer hover:bg-gray-700 transition-colors duration-300 rounded-lg">
                          <div className="flex items-center">
                            <Activity className="mr-2" size={24}/>
                            <span>Relatórios</span>
                          </div>
                          {isOpen('relatorios') ? <ChevronDown size={24}/> : <ChevronRight size={24}/>}
                        </div>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="pl-6 space-y-2">
                        <Link to="/admin/dashboard"
                              className="flex items-center p-2 mt-2 mr-2 rounded-lg hover:bg-gray-700">
                          <LayoutDashboard className="mr-2" size={12}/>
                          <span>Marketing</span>
                        </Link>
                        <Link to="/admin/gestao"
                              className="flex items-center p-2 mt-2 mr-2 rounded-lg hover:bg-gray-700">
                          <Lightbulb className="mr-2" size={12}/>
                          <span>Gestão</span>
                        </Link>
                      </CollapsibleContent>
                    </Collapsible>
                  </li>)}
            </ul>
          </nav>

          <div className="absolute bottom-0 left-0 right-0 p-4 flex justify-between bg-oxfordBlue">
            <button onClick={() => navigate('/admin/profile')} className="flex items-center text-white hover:text-gray-300">
              <User className="mr-2" size={24}/>
              <span>Perfil</span>
            </button>
            <button className="flex items-center text-white hover:text-gray-300" onClick={handleLogout}>
              <LogOut className="mr-2" size={24}/>
              <span>Sair</span>
            </button>
          </div>
        </aside>
      </div>
  )
}
export default AdminSidebar;