import { CalendarIcon } from 'lucide-react'
import {useCallback, useEffect, useState} from 'react'
import { Bar, BarChart, Cell, Funnel, FunnelChart, LabelList, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
  countTotalInvoice, countTotalInvoiceDoctor, findAllMetrics, getBudgetCanal,
  MarketingFilters, MarketingMetricsResponse
} from "@/services/marketingService.ts";
import {Label} from "@/components/ui/label.tsx";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select.tsx";
import {months} from "@/lib/optionsFixed.ts";


const COLORS = ['#0D47A3', '#90CAF9', '#2196F3', '#0D47A1', '#0D47A4']
interface ChannelChart {
  name: string
  total: number
  quantity?: number
  totalDoctor?: number
  profit?: number
  percent?: number
}
export function AdminDashboard() {


  const [totalInvoiceDoctor, setTotalInvoiceDoctor] = useState<ChannelChart[]>([])
  const [totalBudget, setTotalBudget] = useState(0)
  const [exams, setExam] = useState<ChannelChart[]>()
  const [examsRevenue, setExamsRevenue] = useState<ChannelChart[]>()
  const [totalDoctorInvoice, setTotalDoctorInvoice] = useState(0)
  const [totalPatient, setTotalPatient] = useState(0)
  const [totalExams, setTotalExams] = useState(0)
  const [month,setMonth] = useState<number>(new Date().getMonth()+1)
  const [totalInvoice, setTotalInvoice] = useState(0)
  const [metricData, setMetricData] = useState<MarketingMetricsResponse>()
  const [canalMarketingPatient, setCanalMarketingPatient] = useState<ChannelChart[]>([])
  const [canalMarketingExam, setCanalMarketingExam] = useState<ChannelChart[]>([])

  const auth = useAuth()
  const fetchCountPatientByChannel = useCallback(async (filters: MarketingFilters) => {
    if (auth.tenantId) {
      const result = await countChannel(filters, auth.tenantId)
      if(result.data) {
        setCanalMarketingPatient(result.data.data.listChannelPerPatient)
        setCanalMarketingExam(result.data.data.listChannelPerExam)
      }
    }
  },[auth.tenantId])
  const marketingMetricData = [
    { name: 'CPL', total: metricData?.data.CPL },
    { name: 'CPC', total: metricData?.data.CPC },
    { name: 'Ticket Médio', total: metricData?.data.averageTicket },
  ]

  const investmentData = [
    { name: 'Investimento', total: totalBudget },
    { name: 'ROAS', total: metricData?.data.ROAS },
  ]

  const funnelData = [
    { name: 'Cliques', value: metricData?.data.funnel.clicks, fill: '#E3F2FD' },
    { name: 'Leads', value: metricData?.data.funnel.leads, fill: '#E3F2FD' },
    { name: 'Agendamentos', value: metricData?.data.funnel.appointments, fill: '#2196F3' },
    { name: 'Realizados', value: metricData?.data.funnel.completed, fill: '#0D47A1' },
  ]
  const fetchBudget = useCallback(async () => {
    if(auth.tenantId) {
      await getBudgetCanal(auth.tenantId).
      then(
          (result) => {
            setTotalBudget(result.data.data.budget)
          }
      )
    }
  },[auth.tenantId])

  useEffect(() => {
    fetchBudget().then()
  }, [fetchBudget]);
  const fetchCountPatientExam = useCallback(async (filter: MarketingFilters) => {
    if (auth.tenantId) {
      filter = { ...filter, attended: 'Yes'}
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
  const fetchMetricsData = useCallback(async(filter: MarketingFilters) => {
    if (auth.tenantId) {
      const month = filter.month ? filter.month : (new Date().getMonth() + 1);
      const result = await findAllMetrics(month.toString(),auth.tenantId)

      setMetricData(result.data)
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
      filter = { ...filter, attended: 'Yes'}
      const result = await countTotalInvoiceDoctor(filter,auth.tenantId)
      setTotalInvoiceDoctor(result.data.data.quantityExamDoctor)
    }
  },[auth.tenantId])

  useEffect(   () => {
    fetchMetricsData({ month: month }).then()
  }, [fetchMetricsData, month]);
  useEffect(   () => {
    fetchDoctorsTable({ month: month }).then()
  }, [fetchDoctorsTable, month]);
  useEffect(() => {
    fetchCountPatients({ month: month }).then()
  }, [fetchCountPatients, month]);
  useEffect(() => {
    fetchCountExams({ month: month }).then()
  }, [fetchCountExams, month]);
  useEffect(() => {
    fetchCountPatientByChannel({ month: month }).then()
  }, [fetchCountPatientByChannel, month]);

  useEffect(() => {
    fetchCountPatientExam({ month: month }).then()
  }, [fetchCountPatientExam, month]);
  return (
      <div className="w-full p-10 mx-auto text-oxfordBlue">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl mb-6 text-oxfordBlue font-bold tracking-tight">Dashboards</h2>
          <div className="flex text-oxfordBlue flex-row items-center space-x-2">
              <Label className="flex text-nowrap" htmlFor="month-filter">Selecione um Mês</Label>
              <Select defaultValue={month?.toString()} value={month.toString()} onValueChange={(e) => setMonth(Number(e))}>
                <SelectTrigger className="text-oxfordBlue bg-gray-100 p-2 rounded-2xl " id="month-filter">
                  <SelectValue placeholder="Selecione o mês"/>
                </SelectTrigger>
                <SelectContent className="border border-black">
                  <SelectItem value="all">Mês</SelectItem>
                  {months.map((m) => (
                      <SelectItem key={m.value} value={m.value}>
                        {m.label}
                      </SelectItem>
                  ))}
                  <span><CalendarIcon/></span>
                </SelectContent>
              </Select>
          </div>
        </div>
        <Tabs defaultValue="visao-geral" className="space-y-4 text-oxfordBlue ">
          <TabsList>
            <TabsTrigger className="text-oxfordBlue" value="visao-geral">Visão Geral</TabsTrigger>
            <TabsTrigger  className="text-oxfordBlue" value="marketing">Marketing</TabsTrigger>
          </TabsList>
          <TabsContent value="visao-geral" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-oxfordBlue">
                    Faturamento Total do Mês
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
                  <CardTitle className="text-sm font-medium text-oxfordBlue">
                    Total de Pacientes no Mês
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
                  <CardTitle className="text-sm font-medium text-oxfordBlue">
                    Total de Procedimentos realizados no Mês
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
                  <CardTitle className="text-sm font-medium text-oxfordBlue">Lucro</CardTitle>
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
                      className="text-2xl font-bold text-oxfordBlue">R$ {(Number(totalInvoice) - Number(totalDoctorInvoice)).toFixed(2)}</div>
                </CardContent>
              </Card>

            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <Card className="col-span-4">
                <CardHeader>
                  <CardTitle className="text-oxfordBlue">Canais de Aquisição por Pacientes</CardTitle>
                </CardHeader>
                <CardContent className="pl-2">
                  <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={canalMarketingPatient}>
                      <XAxis
                          dataKey="name"
                          stroke="#0D47A1"
                          fontSize={10}
                          tickLine={true}
                          axisLine={true}
                      />
                      <YAxis

                          stroke="#0D47A1"
                          fontSize={10}
                          tickLine={true}
                          axisLine={true}
                      />
                      <Bar  dataKey="total" fill="#2196F3" radius={[4, 4, 0, 0]}/>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              <Card className="col-span-4 lg:col-span-3">
                <CardHeader>
                  <CardTitle className="text-oxfordBlue">Faturamento por Procedimento</CardTitle>
                  <CardDescription className="text-oxfordBlue">
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
                          fill="#2196F3"
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
                <CardTitle className="text-oxfordBlue">Detalhes dos Procedimentos Realizados</CardTitle>
                <CardDescription className="text-oxfordBlue">
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
                  <TableBody className="text-oxfordBlue">
                    {exams?.map((exam) => (
                          <TableRow key={exam.profit}>
                            <TableCell className="font-medium">{exam.name}</TableCell>
                            <TableCell>{exam.quantity}</TableCell>
                            <TableCell>R$ {exam?.total?.toFixed(2)}</TableCell>
                            <TableCell>R$ {exam.totalDoctor}</TableCell>
                            <TableCell>R$ {exam?.profit?.toFixed(2)}</TableCell>
                          </TableRow>
                      )
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-oxfordBlue">Valores a receber</CardTitle>
                <CardDescription className="text-oxfordBlue">
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
                  <TableBody className="text-oxfordBlue">
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
                  <CardTitle className="text-sm font-medium text-oxfordBlue">
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
                  <div className="text-2xl font-bold">{metricData?.data?.CPL?.toFixed(4)}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-oxfordBlue">
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
                  <div className="text-2xl font-bold">{
                    `R$ ${Number(metricData?.data.CAP)?.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                   }</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-oxfordBlue">ROAS</CardTitle>
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
                  <div className="text-2xl font-bold">{metricData?.data.ROAS.toFixed(4)}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-oxfordBlue">
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
                  <div className="text-2xl font-bold">{metricData?.data?.LTV?.toFixed(5)}</div>
                </CardContent>
              </Card>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <Card className="col-span-4">
                <CardHeader>
                  <CardTitle className="text-oxfordBlue">Canais de Aquisição por Exame</CardTitle>
                </CardHeader>
                <CardContent className="pl-2">
                  <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={canalMarketingExam}>
                      <XAxis
                          dataKey="name"
                          stroke="#0D47A1"
                          fontSize={12}
                          tickLine={true}
                          axisLine={true}
                      />
                      <YAxis
                          stroke="#0D47A1"
                          fontSize={12}
                          tickLine={true}
                          axisLine={true}
                      />
                      <Bar dataKey="total" fill="#2196F3" radius={[4, 4, 0, 0]}/>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              <Card className="col-span-4 lg:col-span-3">
                <CardHeader>
                  <CardTitle className="text-oxfordBlue">Funil de Marketing</CardTitle>
                </CardHeader>
                <CardContent className="pl-2">
                  <ResponsiveContainer width="100%" height={350}>
                    <FunnelChart width={700} height={250}>
                      <Tooltip/>
                      <Funnel
                          dataKey="value"
                          data={funnelData}
                          labelLine={true}
                          isAnimationActive
                      >
                        <LabelList  position="right" fill="#000" stroke="none" dataKey="value"/>
                        <LabelList  position="left" fill="#000" stroke="none" dataKey="name"/>
                      </Funnel>
                    </FunnelChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <Card className="col-span-4">
                <CardHeader>
                  <CardTitle className="text-oxfordBlue">Faturamento por Procedimento</CardTitle>
                  <CardDescription className="text-oxfordBlue">
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
                          }) => `${name} ${(percent)?.toFixed(0)}%`}
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
                  <CardTitle className="text-oxfordBlue">Métricas (CPL , CPC, Ticket Médio)</CardTitle>
                </CardHeader>
                <CardContent className="pl-2">
                  <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={marketingMetricData}>
                      <XAxis
                          dataKey="name"
                          stroke="#0D47A1"
                          fontSize={12}
                          tickLine={true}
                          axisLine={true}
                      />
                      <YAxis
                          stroke="#0D47A1"
                          fontSize={12}
                          tickLine={true}
                          axisLine={true}
                          tickFormatter={(value) => `${value}`}
                      />
                      <Bar dataKey="total" fill="#2196F3" radius={[4, 4, 0, 0]}/>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <Card className="col-span-4">
                <CardHeader>
                  <CardTitle className="text-oxfordBlue">Indicadores de Desempenho</CardTitle>
                  <CardDescription className="text-oxfordBlue">Monitoramento das principais métricas de desempenho</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableBody className="text-oxfordBlue">
                      <TableRow key={'1'}>
                        <TableCell className="font-medium">Taxa de aproveitamento</TableCell>
                        <TableCell>{metricData?.data.appointmentRate}</TableCell>
                      </TableRow>
                      <TableRow key={'2'}>
                        <TableCell className="font-medium">Taxa de desistência</TableCell>
                        <TableCell>{metricData?.data.noShowRate}</TableCell>
                      </TableRow>
                      <TableRow key={'3'}>
                        <TableCell className="font-medium">Taxa de ROAS</TableCell>
                        <TableCell>{metricData?.data.roasPercentage}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
              <Card className="col-span-4 lg:col-span-3">
                <CardHeader>
                  <CardTitle className="text-oxfordBlue">Investimento e ROAS</CardTitle>
                </CardHeader>
                <CardContent className="pl-2">
                  <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={investmentData}>
                      <XAxis
                          dataKey="name"
                          stroke="#0D47A1"
                          fontSize={12}
                          tickLine={true}
                          axisLine={true}
                      />
                      <YAxis
                          stroke="#0D47A1"
                          fontSize={12}
                          tickLine={true}
                          axisLine={true}
                          tickFormatter={(value) => `${value}`}
                      />
                      <Bar dataKey="total" fill="#2196F3" radius={[4, 4, 0, 0]}/>
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