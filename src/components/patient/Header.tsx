import {useState} from 'react';
import styles from './Header.module.css';
import {Flask, List, SignOut, UserCircleGear} from 'phosphor-react';
import {NavLink} from 'react-router-dom';
import clintiaLogo from '../../assets/logoClintia.png';
import {useAuth} from "@/hooks/auth.tsx";

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const auth = useAuth();

  const logout = () => {
    auth.logOut()
    setMenuOpen(false)
  }
  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <>
      <aside className={`${styles.sidebar} ${menuOpen ? styles.mobileSidebar : ''}`}>
        <div className={styles.logoContainer}>
          <img src={clintiaLogo} alt="Logo ClintIA" />
          <button className={styles.menuButton} onClick={toggleMenu}>
            <List size={32} color="white" />
          </button>
        </div>

        <nav className={`${styles.nav} ${menuOpen ? styles.open : ''}`}>
          <NavLink to="/paciente/home" title="Exames" onClick={() => setMenuOpen(false)}>
            <Flask className={styles.icon}  />
            Procedimentos
          </NavLink>
          <NavLink to="/paciente/dadoscadastrais" title="Dados Cadastrais" onClick={() => setMenuOpen(false)}>
            <UserCircleGear className={styles.icon}  />
            Dados Cadastrais
          </NavLink>
          <NavLink to="/login" title="Sair" onClick={logout}>
            <SignOut className={styles.icon}  />
            Sair
          </NavLink>
        </nav>
      </aside>
    </>
  );
}
