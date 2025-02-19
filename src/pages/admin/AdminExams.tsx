import {Button} from "@/components/ui/button.tsx"
import {Dialog, DialogContent, DialogHeader, DialogTitle} from "@/components/ui/dialog.tsx"
import {Table, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table.tsx"
import {Card, CardContent} from "@/components/ui/card.tsx";
import {useAuth} from "@/hooks/auth.tsx"
import {listPatientExams, updatePatientExam} from "@/services/patientExamService.tsx"
import {PutObjectCommand, S3Client} from "@aws-sdk/client-s3"
import {FileUp, Upload} from 'lucide-react'
import React, {useEffect, useState} from 'react'
import {toast} from 'react-toastify'
import {IPatientExam} from "@/pages/admin/AdminHome.tsx";
import Cards from "@/components/Card.tsx";
import DataTable from "@/components/DataTable.tsx";
import NoDataTable from "@/components/NoDataTable.tsx";



const s3Client = new S3Client({
  region: "us-east-1",
  credentials: {
    accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID,
    secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY
  }
});

const AdminExams: React.FC = () =>  {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [exams, setExams] = useState<IPatientExam[]>([])
  const auth = useAuth()
  const [isUploading, setIsUploading] = useState(false);
  const [selectedExamId, setSelectedExamId] = useState<number | null>(null);


  useEffect(() => {
    const fetchExams = async () => {
      if (auth.tenantId) {
        const result = await listPatientExams(auth.tenantId, {})
        if (result?.data?.status === "success") {
          setExams(result?.data?.data.exams || [])
        }
      }
    }
    fetchExams().then()
  }, [auth.tenantId])

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0])
    }
  }

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
  }

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    if (event.dataTransfer.files && event.dataTransfer.files[0]) {
      setSelectedFile(event.dataTransfer.files[0])
    }
  }

  const translateStatus = (status: string) => {
    switch (status) {
      case 'Scheduled': 
        return 'Agendado'
      case 'InProgress': 
        return 'Em progresso'
      case 'Completed':
        return 'Concluído'
      default: 
        return ''
    }
  }

  const handleUpload = async () => {
    if (!selectedFile || !selectedExamId || !auth.tenantId) return;
    
    try {
      setIsUploading(true);
      
      const fileKey = `${auth.tenantId}/exams/${Date.now()}-${selectedFile.name}`;
      const bucketName = import.meta.env.VITE_AWS_BUCKET_NAME;
      
      if (!bucketName) {
        new Error('Bucket name não configurado');
      }

      await s3Client.send(new PutObjectCommand({
        Bucket: bucketName,
        Key: fileKey,
        Body: selectedFile,
        ContentType: selectedFile.type
      }));

      const fileUrl = `https://${bucketName}.s3.amazonaws.com/${fileKey}`;

      const result = await updatePatientExam(auth.tenantId, selectedExamId, {
        status: 'Completed',
        link: fileUrl
      });

      if (result?.data?.status === "success") {
        toast.success("Arquivo enviado com sucesso!");
        const updatedExams = await listPatientExams(auth.tenantId!, {});
        if (updatedExams?.data?.status === "success") {
          setExams(updatedExams.data.data.exames[0].patientExams || []);
        }
      }

    } catch (error) {
      console.error(error);
      toast.error("Erro ao enviar arquivo");
    } finally {
      setIsUploading(false);
      setIsDialogOpen(false);
      setSelectedFile(null);
      setSelectedExamId(null);
    }
  };
  const renderRow = (exam: IPatientExam) => (
      <>
        <TableCell className="text-oxfordBlue font-bold">{exam?.patient?.full_name}</TableCell>
        <TableCell className="text-oxfordBlue00">{exam?.exam?.exam_name}</TableCell>
        <TableCell className="text-oxfordBlue00">{new Date(exam?.createdAt).toLocaleDateString()}</TableCell>
        <TableCell className="text-oxfordBlue00">{new Date(exam?.examDate).toLocaleDateString()}</TableCell>
        <TableCell className="text-oxfordBlue00">{translateStatus(exam?.status)}</TableCell>
        <TableCell>
          <Button
              onClick={() => {
                setSelectedExamId(exam?.id);
                setIsDialogOpen(true);
              }}
              disabled={exam?.status === 'Completed'}
          >
            <Upload className="mr-2 h-4 w-4"/> Upload
          </Button>
        </TableCell>
      </>
  );

  return (
      <div className="w-full p-10 mx-auto">

        <h1 className="text-3xl mb-6 font-bold tracking-tight">Upload de Resultados</h1>
        <div className="flex flex-col md:flex-row gap-3 mb-6">
          <Cards name='Agendamentos Pendentes' content={exams?.length}/>
          <Cards name='Agendamentos Concluídos' content={exams?.length}/>
        </div>
        <Card>
          <CardContent>
            {
              exams.length === 0 ?
                  (
                      <div className="p-10">
                        <NoDataTable message="Não possui procedimentos realizados"/>
                      </div>
                  ) : (
                    <div className="overflow-x-auto w-full">
                      <Table className="min-w-full">
                        <TableHeader>
                          <TableRow>
                            <TableHead>Paciente</TableHead>
                            <TableHead>Tipo de Procedimento</TableHead>
                            <TableHead>Data de Criação</TableHead>
                            <TableHead>Data de Agendamento</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Ação</TableHead>
                          </TableRow>
                        </TableHeader>
                        <DataTable renderRow={renderRow} openModalBooking={false} openModalEdit={() => {}}
                                   deleteData={() => {}} dataTable={exams}></DataTable>
                      </Table>
                    </div>
                  )
            }

          </CardContent>
        </Card>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="bg-white">
            <DialogHeader>
              <DialogTitle>Upload de Arquivo</DialogTitle>
            </DialogHeader>
            <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-10 text-center cursor-pointer"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => document.getElementById('fileInput')?.click()}
            >
              <input
                  id="fileInput"
                  type="file"
                  className="hidden"
                  onChange={handleFileChange}
                  accept=".pdf,.jpg,.jpeg,.png"
              />
              <div className="flex flex-col items-center gap-2">
                <FileUp className="w-10 h-10 text-gray-400"/>
                {selectedFile ? (
                    <p>Arquivo selecionado: {selectedFile.name}</p>
                ) : (
                    <p>Arraste um arquivo aqui ou clique para selecionar</p>
                )}
              </div>
            </div>
            <Button
                onClick={handleUpload}
                disabled={!selectedFile || isUploading}
            >
              {isUploading ? "Enviando..." : "Enviar Arquivo"}
            </Button>
          </DialogContent>
        </Dialog>
      </div>
  )
}
export default AdminExams;