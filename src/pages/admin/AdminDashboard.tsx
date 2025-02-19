import { addDays, format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { CalendarIcon } from 'lucide-react'
import {useCallback, useEffect, useState} from 'react'
import { DateRange } from 'react-day-picker'
import { Bar, BarChart, Cell, Funnel, FunnelChart, LabelList, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {useAuth} from "@/hooks/auth.tsx";
import {
  countChannel, countPatientExamWithFilters, countPatientWithFilters,
  countTotalInvoice, countTotalInvoiceDoctor,
  MarketingFilters
} from "@/services/marketingService.ts";


const marketingMetricData = [
  { name: 'CPL', total: 1230 },
  { name: 'CPC', total: 751 },
  { name: 'Ticket Médio', total: 471 },
]

const investmentData = [
  { name: 'Investimento', total: 432 },
  { name: 'ROAS', total: 1230 },
]




const funnelData = [
  { name: 'Cliques', value: 500, fill: '#FFBB28' },
  { name: 'Leads', value: 400, fill: '#FF8042' },
  { name: 'Agendamentos', value: 300, fill: '#0088FE' },
  { name: 'Realizados', value: 100, fill: '#00C49F' },
]

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']
interface ChannelChart {
  name: string
  total: number
  quantity?: number
  totalDoctor?: number
  profit?: number
  percent?: number
}
export function AdminDashboard() {
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(2024, 0, 1),
    to: addDays(new Date(2024, 0, 1), 20),
  })


  const [totalInvoiceDoctor, setTotalInvoiceDoctor] = useState<ChannelChart[]>([])
  const [exams, setExam] = useState<ChannelChart[]>()
  const [examsRevenue, setExamsRevenue] = useState<ChannelChart[]>()
  const [totalDoctorInvoice, setTotalDoctorInvoice] = useState(0)
  const [totalPatient, setTotalPatient] = useState(0)
  const [totalExams, setTotalExams] = useState(0)
  const [totalInvoice, setTotalInvoice] = useState(0)
  const [canalMarketing, setCanalMarketing] = useState<ChannelChart[]>([])
  const auth = useAuth()
  const fetchCountPatient = useCallback(async () => {
    if (auth.tenantId) {
      const result = await countChannel(auth.tenantId)
      if(result.data) {
        setCanalMarketing(result.data.data.listChannelPerPatient)

      }
    }
  },[auth.tenantId])

  const fetchCountPatientExam = useCallback(async (filter: MarketingFilters) => {
    if (auth.tenantId) {
      filter = { ...filter, attended: 'Sim'}
      const result = await countTotalInvoice(filter,auth.tenantId)
      setTotalInvoice(result.data.data.generalTotalInvoice)
      setTotalDoctorInvoice(result.data.data.doctorTotalInvoice)
      setExam(result.data.data.totalPerExam)
      setExamsRevenue(result.data.data.totalPerExam)
    }

  },[auth.tenantId])

  const fetchCountPatients = useCallback(async(filter: MarketingFilters) => {
    if (auth.tenantId) {
      const result = await countPatientWithFilters(filter,auth.tenantId)
      setTotalPatient(result.data.data.total)
    }
  },[auth.tenantId])
  const fetchCountExams = useCallback(async(filter: MarketingFilters) => {
    if (auth.tenantId) {
      const result = await countPatientExamWithFilters(filter,auth.tenantId)
      setTotalExams(result.data.data.total)
    }
  },[auth.tenantId])
  const fetchDoctorsTable = useCallback(async(filter: MarketingFilters) => {
    if (auth.tenantId) {
      filter = { ...filter, attended: 'Sim'}
      const result = await countTotalInvoiceDoctor(filter,auth.tenantId)
      setTotalInvoiceDoctor(result.data.data.quantityExamDoctor)
    }
  },[auth.tenantId])

  useEffect(   () => {
    fetchDoctorsTable({}).then()
  }, [fetchDoctorsTable]);

  useEffect(() => {
    const filters = {}
    fetchCountPatients(filters).then()
  }, [fetchCountPatients]);
  useEffect(() => {
    const filters = {}
    fetchCountExams(filters).then()
  }, [fetchCountExams]);
  useEffect(() => {
    fetchCountPatient().then()
  }, [fetchCountPatient]);

  useEffect(() => {
    fetchCountPatientExam({}).then()
  }, [fetchCountPatientExam]);
  return (
      <div className="w-full p-10 mx-auto">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl mb-6 font-bold tracking-tight">Dashboards</h2>
          <div className="flex items-center space-x-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                    id="date"
                    variant={"outline"}
                    className={` hidden w-[300px] justify-start text-left font-normal`}
                >
                  <CalendarIcon className="mr-2 h-4 w-4"/>
                  {date?.from ? (
                      date.to ? (
                          <>
                            {format(date.from, "dd 'de' MMMM", {locale: ptBR})} -{" "}
                            {format(date.to, "dd 'de' MMMM, yyyy", {locale: ptBR})}
                          </>
                      ) : (
                          format(date.from, "dd 'de' MMMM, yyyy", {locale: ptBR})
                      )
                  ) : (
                      <span>Selecione uma data</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={date?.from}
                    selected={date}
                    onSelect={setDate}
                    numberOfMonths={2}
                    locale={ptBR}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
        <Tabs defaultValue="visao-geral" className="space-y-4">
          <TabsList>
            <TabsTrigger value="visao-geral">Visão Geral</TabsTrigger>
            <TabsTrigger value="marketing">Marketing</TabsTrigger>
          </TabsList>
          <TabsContent value="visao-geral" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Faturamento Total
                  </CardTitle>
                  <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      className="h-4 w-4 text-muted-foreground"
                  >
                    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                  </svg>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">R$ {totalInvoice.toString().replace('.', ',')}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total de Pacientes
                  </CardTitle>
                  <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      className="h-4 w-4 text-muted-foreground"
                  >
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
                  </svg>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalPatient}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Procedimentos realizados
                  </CardTitle>
                  <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      className="h-4 w-4 text-muted-foreground"
                  >
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                  </svg>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalExams}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Lucro</CardTitle>
                  <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      className="h-4 w-4 text-muted-foreground"
                  >
                    <rect width="20" height="14" x="2" y="5" rx="2"/>
                    <path d="M2 10h20"/>
                  </svg>
                </CardHeader>
                <CardContent>
                  <div
                      className="text-2xl font-bold">R$ {(Number(totalInvoice) - Number(totalDoctorInvoice)).toFixed(2)}</div>
                </CardContent>
              </Card>

            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <Card className="col-span-4">
                <CardHeader>
                  <CardTitle>Canais de Aquisição de Pacientes</CardTitle>
                </CardHeader>
                <CardContent className="pl-2">
                  <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={canalMarketing}>
                      <XAxis
                          dataKey="name"
                          stroke="#888888"
                          fontSize={10}
                          tickLine={true}
                          axisLine={true}
                      />
                      <YAxis

                          stroke="#888888"
                          fontSize={10}
                          tickLine={true}
                          axisLine={true}
                      />
                      <Bar dataKey="total" fill="#adfa1d" radius={[4, 4, 0, 0]}/>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              <Card className="col-span-4 lg:col-span-3">
                <CardHeader>
                  <CardTitle>Faturamento por Procedimento</CardTitle>
                  <CardDescription>
                    Distribuição do faturamento entre os principais procedimentos
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                          data={examsRevenue?.filter((exam) => exam.profit !== 0)}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={70}
                          fill="#8884d8"
                          dataKey="percent"
                          label={({name, percent}: {
                            name: string;
                            percent: number
                          }) => `${name} ${(percent).toFixed(0)}%`}
                      >
                        {exams?.map((_entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]}/>
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Detalhes dos Procedimentos Realizados</CardTitle>
                <CardDescription>
                  Informações detalhadas sobre procedimentos, pagamentos e lucros.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome do Procedimento</TableHead>
                      <TableHead>Quantidade Realizada</TableHead>
                      <TableHead>Valor Total</TableHead>
                      <TableHead>Pagamento aos Profissionais</TableHead>
                      <TableHead>Lucro</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {exams?.map((exam) => {

                      return (
                          <TableRow key={exam.profit}>
                            <TableCell className="font-medium">{exam.name}</TableCell>
                            <TableCell>{exam.quantity}</TableCell>
                            <TableCell>R$ {exam.total.toFixed(2)}</TableCell>
                            <TableCell>R$ {exam.totalDoctor}</TableCell>
                            <TableCell>R$ {exam.profit?.toFixed(2)}</TableCell>
                          </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Valores a receber</CardTitle>
                <CardDescription>
                  Informações detalhadas da quantidade de procedimentos realizadas por cada profissional.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome do Profissional</TableHead>
                      <TableHead>Procedimentos Realizados</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {totalInvoiceDoctor?.map((row) => {
                      return (
                          <TableRow key={row.name}>
                            <TableCell className="font-medium">{row.name}</TableCell>
                            <TableCell>{row.quantity}</TableCell>
                          </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="marketing" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    CPL
                  </CardTitle>
                  <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      className="h-4 w-4 text-muted-foreground"
                  >
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
                  </svg>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">R$ 7,23</div>
                  <p className="text-xs text-muted-foreground">
                    - R$ 2,12 desde o mês passado
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    CAP
                  </CardTitle>
                  <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      className="h-4 w-4 text-muted-foreground"
                  >
                    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                  </svg>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">R$ 15,25</div>
                  <p className="text-xs text-muted-foreground">
                    - R$ 0,95 desde o mês passado
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">ROAS</CardTitle>
                  <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      className="h-4 w-4 text-muted-foreground"
                  >
                    <rect width="20" height="14" x="2" y="5" rx="2"/>
                    <path d="M2 10h20"/>
                  </svg>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">R$ 70,50</div>
                  <p className="text-xs text-muted-foreground">
                    +5% desde o mês passado
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    LTV
                  </CardTitle>
                  <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      className="h-4 w-4 text-muted-foreground"
                  >
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                  </svg>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">2 meses</div>
                  <p className="text-xs text-muted-foreground">
                    +20% desde o ano passado
                  </p>
                </CardContent>
              </Card>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <Card className="col-span-4">
                <CardHeader>
                  <CardTitle>Canais de Aquisição de Pacientes</CardTitle>
                </CardHeader>
                <CardContent className="pl-2">
                  <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={canalMarketing}>
                      <XAxis
                          dataKey="name"
                          stroke="#888888"
                          fontSize={12}
                          tickLine={true}
                          axisLine={true}
                      />
                      <YAxis
                          stroke="#888888"
                          fontSize={12}
                          tickLine={true}
                          axisLine={true}
                      />
                      <Bar dataKey="total" fill="#adfa1d" radius={[4, 4, 0, 0]}/>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              <Card className="col-span-4 lg:col-span-3">
                <CardHeader>
                  <CardTitle>Funil de Marketing</CardTitle>
                </CardHeader>
                <CardContent className="pl-2">
                  <ResponsiveContainer width="100%" height={350}>
                    <FunnelChart width={730} height={250}>
                      <Tooltip/>
                      <Funnel
                          dataKey="value"
                          data={funnelData}
                          isAnimationActive
                      >
                        <LabelList position="right" fill="#000" stroke="none" dataKey="name"/>
                      </Funnel>
                    </FunnelChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <Card className="col-span-4">
                <CardHeader>
                  <CardTitle>Faturamento por Procedimento</CardTitle>
                  <CardDescription>
                    Distribuição do faturamento entre os principais procedimentos
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                          data={examsRevenue?.filter((exam) => exam.percent !== 0)}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="percent"
                          label={({name, percent}: {
                            name: string;
                            percent: number
                          }) => `${name} ${(percent).toFixed(0)}%`}
                      >
                        {exams?.map((_entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]}/>
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="col-span-4 lg:col-span-3">
                <CardHeader>
                  <CardTitle>Métricas (CPL , CPC, Ticket Médio)</CardTitle>
                </CardHeader>
                <CardContent className="pl-2">
                  <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={marketingMetricData}>
                      <XAxis
                          dataKey="name"
                          stroke="#888888"
                          fontSize={12}
                          tickLine={false}
                          axisLine={false}
                      />
                      <YAxis
                          stroke="#888888"
                          fontSize={12}
                          tickLine={false}
                          axisLine={false}
                          tickFormatter={(value) => `${value}`}
                      />
                      <Bar dataKey="total" fill="#adfa1d" radius={[4, 4, 0, 0]}/>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <Card className="col-span-4">
                <CardHeader>
                  <CardTitle>Indicadores de Desempenho</CardTitle>
                  <CardDescription>Monitoramento das principais métricas de desempenho</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableBody>
                      <TableRow key={'1'}>
                        <TableCell className="font-medium">Taxa de aproveitamento</TableCell>
                        <TableCell>35%</TableCell>
                      </TableRow>
                      <TableRow key={'2'}>
                        <TableCell className="font-medium">Taxa de desistência</TableCell>
                        <TableCell>11%</TableCell>
                      </TableRow>
                      <TableRow key={'3'}>
                        <TableCell className="font-medium">Taxa de absenteísmo</TableCell>
                        <TableCell>23%</TableCell>
                      </TableRow>
                      <TableRow key={'4'}>
                        <TableCell className="font-medium">Taxa de ROAS</TableCell>
                        <TableCell>43%</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
              <Card className="col-span-4 lg:col-span-3">
                <CardHeader>
                  <CardTitle>Investimento e ROAS</CardTitle>
                </CardHeader>
                <CardContent className="pl-2">
                  <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={investmentData}>
                      <XAxis
                          dataKey="name"
                          stroke="#888888"
                          fontSize={12}
                          tickLine={false}
                          axisLine={false}
                      />
                      <YAxis
                          stroke="#888888"
                          fontSize={12}
                          tickLine={false}
                          axisLine={false}
                          tickFormatter={(value) => `${value}`}
                      />
                      <Bar dataKey="total" fill="#adfa1d" radius={[4, 4, 0, 0]}/>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
)
}

export default AdminDashboard;