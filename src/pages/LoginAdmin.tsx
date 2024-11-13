import React, {useEffect, useState} from 'react';
import { useNavigate} from "react-router-dom";
import logoClintia from '../assets/logoClintia.png';
import {useAuth} from "../hooks/auth.tsx";
import { Button } from "@/components/ui/button"
import {Input} from "@mui/material";
import {jwtDecode} from "jwt-decode";
import {ITokenPayload} from "@/types/Auth.ts";
import GeneralModal from "@/components/ModalHandle/GeneralModal.tsx";


const LoginAdmin: React.FC = () => {

    const navigate = useNavigate();
    const auth = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isErrorModalOpen, setIsErrorModalOpen] = useState(false)
    const [errorMessage, setErrorMessage] = useState('')
    useEffect(() => {
        const getTenant = () => {
            if(auth?.token) {
                const decoded: ITokenPayload = jwtDecode(auth.token?.toString())
                if(decoded.isAdmin) {
                    navigate('/admin/home')
                }
            }
        }
        getTenant()
    },[auth.token, navigate])

    const handleLogin = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault()
        if (!email || !password) {
            setErrorMessage('Preencha seu email e senha')
            setIsErrorModalOpen(true)
            return
        }
        if (email && password) {
            const result = await auth.adminLogin(email, password)
            if(!result) {
                setErrorMessage('Erro ao Realizar login')
                setIsErrorModalOpen(true)
                return
            }
                if(result?.status === "error") {
                    setErrorMessage(result.message)
                    setIsErrorModalOpen(true)
                    return
                }
                if(result?.status === "success" && result?.data !== null) {
                    return  navigate('/admin/home')
                }
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
                                        <h3
                                            className="m-4 pb-1 text-sm tracking-widest text-white font-semibold">
                                            Acesso Admin
                                        </h3>
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
                                                {/* Username Input */}
                                                <div className="flex flex-col relative">
                                                    <div className="mb-4">
                                                        <Input autoComplete="true"  placeholder="Email"
                                                               className='!text-white focus:text-white border-b border-blue-500 p-1 w-full'
                                                               type='text' value={email}
                                                               onChange={(e) => setEmail(e.target?.value)}/>

                                                    </div>
                                                    <div className='mb-4'>
                                                        <Input autoComplete="true" placeholder="Senha"
                                                               className='!text-white focus:text-white border-b border-blue-500 p-1 w-full'
                                                               type='password' value={password}
                                                               onChange={(e) => setPassword(e.target.value)}/>

                                                    </div>
                                                </div>
                                                {/* Submit Button */}
                                                <div className="mb-12 pb-1 pt-1 text-center">
                                                    <Button
                                                        variant="outline"
                                                        onClick={(e) => handleLogin(e)}
                                                        className="mb-3 inline-block w-full bg-gray-800 hover:bg-amber-100 hover:text-black rounded px-6 pb-2 pt-2.5 text-xs font-medium uppercase leading-normal text-white shadow-dark-3 transition duration-150 ease-in-out hover:shadow-dark-2 focus:shadow-dark-2 focus:outline-none focus:ring-0 active:shadow-dark-2 dark:shadow-black/30 dark:hover:shadow-dark-strong dark:focus:shadow-dark-strong dark:active:shadow-dark-strong"
                                                    >
                                                        Acessar
                                                    </Button>
                                                    <GeneralModal
                                                        error={true}
                                                        action={'Close'}
                                                        isOpen={isErrorModalOpen}
                                                        onClose={() => setIsErrorModalOpen(false)}
                                                        message={errorMessage}/>
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

export default LoginAdmin;
