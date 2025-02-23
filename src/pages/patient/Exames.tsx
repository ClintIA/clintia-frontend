import '../../global.css';
import styles from './Exames.module.css';
import {Post} from '../../components/patient/Post';
import {ConsultorioDropdown} from '../../components/patient/ConsultorioDropdown';
import {useEffect, useState} from 'react';
import logoExam from '../../assets/icon-clintia.png';
import {getPatientExams} from '@/api/patient-exams.ts';
import {useAuth} from '../../hooks/auth';


// interface Exam {
//   id: number;
//   exam_name: string;
// }

// interface PatientExam {
//   id: number;
//   link: string | null;
//   createdAt: string;
//   examDate: string;
//   uploadedAt: string | null;
//   status: string;
//   exam: Exam;
// }

// interface Tenant {
//   id: number;
//   name: string;
//   patientExams: PatientExam[];
// }

interface Tenant {
  id: number;
  name: string;
}

interface Patient {
  id: number;
  full_name: string;
}

export interface APIExam {
  id: number;
  link: string | null;
  createdAt: string;
  examDate: string;
  uploadedAt: string | null;
  status: string;
  patient: Patient;
  exam: {
    exam_name: string;
    tenant: Tenant;
  };
}

export interface MappedExam {
  id: number;
  nome: string;
  avatarUrl: string;
  link: string | null;
  consultorio: string;
  data: string;
  horario: string;
  resultado: string;
  resumo: string;
}

export function Exames() {
  const [exames, setExames] = useState<MappedExam[]>([]);
  const [filteredExames, setFilteredExames] = useState<MappedExam[]>([]);
  const { userId } = useAuth();

  useEffect(() => {
  
    async function fetchExames() {
      try {
        const response = await getPatientExams(Number(userId));

        if (!response.data || !response.data.exams || response.data.exams.length === 0) {
          setExames([]);
          setFilteredExames([]);
          return;
        }

        // const apiExames: Exame[] = response.data.exames.flatMap((tenant: Tenant) =>
        //   tenant.patientExams.map((exam: PatientExam) => ({
        //     id: exam.id.toString(),
        //     nome: exam.exam.exam_name,
        //     avatarUrl: logoExam,
        //     link: exam.link,
        //     consultorio: tenant.name,
        //     data: new Date(exam.examDate),
        //     horario: new Date(exam.examDate).toLocaleTimeString(),
        //     resultado: exam.status,
        //     resumo: `Resumo do exame ${exam.exam.exam_name}`
        //   }))
        // );

        const apiExames: MappedExam[] = response.data.exams.map((exam: APIExam) => ({
          id: exam.id,
          nome: exam.exam.exam_name,
          avatarUrl: logoExam,
          link: exam.link,
          consultorio: exam.exam.tenant.name,
          data: new Date(exam.examDate).toLocaleDateString('pt-BR'),
          horario: new Date(exam.examDate).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          resultado: exam.status,
          resumo: `Resumo do Procedimento: ${exam.exam.exam_name}`
        }));

        setExames(apiExames);
        setFilteredExames(apiExames);
      } catch (error) {
        console.error("Erro ao buscar procedimento:", error);
      }
    }

    fetchExames();
  }, [userId]);

  const handleSelectConsultorio = (consultorio: string) => {
    if (consultorio === "Todos") {
      setFilteredExames(exames);
    } else {
      const filtered = exames.filter(exame => exame.consultorio === consultorio);
      setFilteredExames(filtered);
    }
  };

  const consultorios = Array.from(new Set(exames.map(exame => exame.consultorio)));

  return (
      <div>
      <div className={styles.wrapper}>
        <main>
          <div>
            <h1 className={styles.title}>Resultado de Procedimentos</h1>
            <ConsultorioDropdown consultorios={consultorios} onSelectConsultorio={handleSelectConsultorio} />
          </div>

          {filteredExames.length === 0 ? (
          <p className={styles.noExamsMessage}>Sem procedimentos cadastrados</p>
        ) : (
          filteredExames.map(exame => (
            <Post
              key={exame.id}
              post={exame}
            />
            
          ))
        )}
        </main>
      </div>
      </div>
  );
}
