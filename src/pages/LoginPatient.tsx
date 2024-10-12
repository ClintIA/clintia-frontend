import React, { useState} from 'react';
import logoClintia from '../assets/logoClintia.png';
import {Button, Input} from "@mui/material";
import LoginError from "@/components/LoginError.tsx";
import {useNavigate} from "react-router-dom";
import {useAuth} from "@/hooks/auth.tsx";
import {isAxiosError} from "axios";

const LoginPatient: React.FC = () => {
    const [patientCpf, setPatientCpf] = useState("");
    const navigate = useNavigate();
    const auth = useAuth();
    const [showError, setShowError] = useState(false);
    const [error, setError] = useState("");
    const handleLogin = () => {
        if (!patientCpf) {
            setShowError(true)
            throw Error('Preencha seu email e senha')
        }
        try {
           auth.patientLogin(patientCpf).then((result) => {
               if(isAxiosError(result)) {
                   if(result.status === 200) {
                       navigate("/paciente");
                   }
                   if(result.status === 401) {
                       navigate('/error-401')
                   }
               }
           })
        } catch (err) {
            setError(err instanceof Error ? err.message : "Erro ao realizar login")
        }
    }

    return (
        <div className="gradient-form bg-oxfordBlue">
            <div className="container h-screen w-max m-auto">
                <div
                    className="flex h-full items-center justify-center text-neutral-800 dark:text-neutral-200">
                    <div className="w-full">
                        <div
                            className="block rounded-lg bg-oxfordBlue shadow-lg shadow-amber-100 dark:bg-neutral-800">
                            <div className="flex justify-center">

                                <div className="text-center">
                                    <div className="md:mx-6 md:px-12">
                                        {/* Logo */}
                                        <div className="text-center">
                                            {/* Logo */}
                                            <div className="p-4">
                                                <img src={logoClintia} alt="Logo"
                                                     className="w-30 mb-4 shadow shadow-amber-50"/>
                                            </div>
                                            <h4 className="mb-12 mt-1 pb-1 text-xl tracking-widest text-white font-semibold">
                                                Bem vindo a ClintIA.
                                            </h4>
                                        </div>

                                        <form id="login-form">
                                            {/* CPF Input */}
                                            <div className="flex flex-col relative">
                                                <div className="mb-4">
                                                    <Input error={showError} placeholder="Digite seu CPF"
                                                           className='!text-white focus:text-white border-b border-blue-500 p-1 w-full'
                                                           type='text' value={patientCpf}
                                                           onChange={(e) => setPatientCpf(e.target.value)}/>
                                                </div>
                                            </div>
                                            {/* Submit Button */}
                                            <div className="mb-12 pb-1 pt-1 text-center">
                                                <Button
                                                    variant="outlined"
                                                    onClick={handleLogin}
                                                    className="mb-3 inline-block w-full bg-gray-800 hover:bg-amber-100 hover:text-black rounded px-6 pb-2 pt-2.5 text-xs font-medium uppercase leading-normal text-white shadow-dark-3 transition duration-150 ease-in-out hover:shadow-dark-2 focus:shadow-dark-2 focus:outline-none focus:ring-0 active:shadow-dark-2 dark:shadow-black/30 dark:hover:shadow-dark-strong dark:focus:shadow-dark-strong dark:active:shadow-dark-strong"
                                                >
                                                    Acessar
                                                </Button>
                                                {error && <LoginError message={error}/>}
                                            </div>
                                        </form>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPatient;
