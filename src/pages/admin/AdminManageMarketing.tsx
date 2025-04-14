import React, {useCallback, useEffect, useState} from "react";
import {ArcElement, Chart as ChartJS, Legend, Tooltip} from 'chart.js'
import {Card, CardContent, CardTitle} from "@/components/ui/card"
import {Input} from "@/components/ui/input"
import {Button} from "@/components/ui/button"
import { Doughnut } from 'react-chartjs-2'
import { useToast } from "@/hooks/use-toast"
import ChartDataLabels from 'chartjs-plugin-datalabels';
import {
    getBudgetCanal,
    listCanalMarketing,
    updateBudgetCanal,
    updateCanalMarketing
} from "@/services/marketingService.ts";
import {useAuth} from "@/hooks/auth.tsx";
import {Label} from "@/components/ui/label.tsx";
import CardMarketing from "@/components/CardMarketing.tsx";
import {BadgeInfo} from "lucide-react";
import {Spinner} from "@/components/ui/Spinner.tsx";
import {ToastAction} from "@/components/ui/toast.tsx";
import {IMarketing} from "@/types/Marketing.ts";

ChartJS.register(ArcElement, Tooltip, Legend,ChartDataLabels)

const AdminManageMarketing: React.FC = () => {

    const [totalBudget, setTotalBudget] = useState(0)
    const [newTotalBudget, setNewTotalBudget] = useState(0)
    const [activeCanal, setActiveCanal] = useState<string | undefined>('Instagram')
    const [canal,setCanal] = useState<IMarketing>()
    const [updateMetrics,setUpdateMetrics] = useState<IMarketing>({} as IMarketing)
    const [allocations, setAllocations] = useState<IMarketing[]>([])
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [isEditing, setIsEditing] = useState(false)
    const { toast } = useToast()
    const auth = useAuth();

    const handleCanalMetrics = (canal: IMarketing) => {
        if(canal) {
            setActiveCanal(canal.canal)
            setCanal(canal)
            setIsEditing(false)
        }
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setUpdateMetrics(prev => ({ ...prev, [name]: value }))
    }

    const metrics = [
        { name: "Clicks", value: "clicks", prefix: "" },
        { name: "Custos", value: "cost", prefix: "R$" },
        { name: "Leads", value: "leads", prefix: "" },
        { name: "Orçamento", value: "budgetCanal", prefix: "R$" },
    ]
    const formatValue = (value: string | number | undefined) => {
        let newValue: string | number | undefined;
        switch(value) {
            case 'clicks':
                newValue = canal?.clicks
                break;
            case 'leads':
                newValue = canal?.leads
                break;
            case 'cost':
                newValue = canal?.cost
                break;
            case 'budgetCanal':
                newValue = canal?.budgetCanal
                break;
        }
        if (typeof newValue === "string") {
            return `${Number(newValue).toLocaleString("pt-BR", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            })}`
        }
        return `${newValue || ""}`!
    }
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        const newMetrics: IMarketing = {
            id: Number(canal?.id),
            canal: canal?.canal,
            cost: updateMetrics.cost || canal?.cost,
            budgetCanal: updateMetrics.budgetCanal || canal?.cost,
            clicks: updateMetrics.clicks || canal?.clicks,
            leads: updateMetrics.leads || canal?.leads,
        }
        if(auth.tenantId) {
            const result = await updateCanalMarketing({
                ...newMetrics,
                id: Number(canal?.id),
                cost: updateMetrics.cost?.replace(',','.'),
                budgetCanal: updateMetrics.budgetCanal?.replace(',','.'),
            },
                auth.tenantId)
            if(!result.data) {
               return toast({
                    variant: 'destructive',
                    title: 'ClintIA - Soluções tecnologicas',
                    description: 'Verifique os dados inseridos. Lead e Clicks são numeros inteiros',
                    action: <ToastAction altText="Try again">Try again</ToastAction>,
                   duration: 1000

                })
            }
            if(result.status == 200) {
                fetchCanal().then()
                if(canal?.canal) {
                    setActiveCanal(canal.canal)
                }
            }
        }
        setIsEditing(false)
        toast({
            title: 'ClintIA - Soluções Tecnológicas',
            description: 'Métrica atualizada',
            duration: 1000
        })
    }
    const fetchCanal = useCallback(async () => {
        setIsLoading(true)
        if (auth.tenantId) {
            const result = await listCanalMarketing(auth.tenantId)
            if (result.data) {
                setAllocations(result.data.data)
                setIsLoading(false)
                setCanal(result.data.data[0])
            }

        }
    },[])

    const fetchBudget = useCallback(async () => {
        if(auth.tenantId) {
            setIsLoading(true)

            await getBudgetCanal(auth.tenantId).
                then(
                (result) => {
                    setTotalBudget(result.data.data.budget)
                    setIsLoading(false)
                }
            )
        }
    },[auth.tenantId])

    useEffect(() => {
        fetchBudget().then()
    }, [fetchBudget]);
    useEffect(   () => {
        fetchCanal().then()
    }, [fetchCanal]);

    const calculateTotalAllocation = () => allocations.reduce((sum, alloc) => Number(sum) + Number(alloc.budgetCanal), 0)

    const calculatePercentages = () => {
        return allocations?.map(alloc => ({
            ...alloc,
            percentage: ((Number(alloc.budgetCanal) / totalBudget) * 100).toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 }),
            formattedAmount: `R$ ${Number(alloc.budgetCanal).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
        }))
    }

    const updateBudgetTenant = async () => {
      if(auth.tenantId) {
          setIsLoading(true)

          const result = await updateBudgetCanal(Number(newTotalBudget), auth.tenantId)
          if(result.data.data) {
              setTotalBudget(result.data.data.budget)
              fetchCanal().then()
              fetchBudget().then()
              setIsLoading(false)
              toast({
                      title: 'ClintIA',
                      description: 'Orçamento atualizada atualizado'
                  }
              )
          }

      }
    }

    const chartData = {
        labels: calculatePercentages().map(a => `${a.canal} (${a.percentage}%)`),
        datasets: [
            {
                data: allocations.map(a => a.budgetCanal),
                backgroundColor: [
                    'rgb(3, 30, 50,1)',
                    'rgba(5, 166, 205, 1)',
                    'rgb(2,120,220,1)',
                    'rgb(3, 30, 50,1)'
                ],
            },
        ],
    }
    if(isLoading) {
        return (
            <div className="flex justify-center">
                <Spinner className="mt-50 w-80 h-48" />
            </div>
        )
    }
    return (
        <div className="w-full p-10 mx-auto">
            <h1 className="text-3xl mb-6 font-bold tracking-tight">Gerenciamento Financeiro do Marketing</h1>
            <div className="flex flex-col xl:flex-row space-x-3">
                <Card className="drop-shadow-lg shadow-gray-300 col-span-2 mb-4 w-max p-1">
                    <CardContent>
                        <div className="flex justify-between space-x-2 items-center p-2">
                            <div className="flex flex-col">
                                <Label htmlFor="totalBudget" className="my-2 font-bold text-base text-oxfordBlue">
                                    Total Budget
                                </Label>
                                <Input
                                    name="budgetCanal"
                                    type="text"

                                    placeholder={`R$ ${newTotalBudget !== 0 ? (newTotalBudget).toLocaleString('pt-BR', {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2
                                    }) : (totalBudget).toLocaleString('pt-BR', {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2
                                    })}`}
                                    onChange={(e) => {
                                        const value = e.target.value.replace(/[^0-9,]/g, '').replace(',', '.');
                                        setNewTotalBudget(Number(value));
                                    }}
                                    className="w-full mr-2"
                                />
                            </div>
                            <Button className="mt-10" onClick={updateBudgetTenant}>Atualizar</Button>
                        </div>
                    </CardContent>
                </Card>
                <div className="flex flex-row space-x-2">
                    <CardMarketing prefix={`R$`} name="Total Distriuído"
                                   content={calculateTotalAllocation().toLocaleString('pt-BR', {
                                       minimumFractionDigits: 2,
                                       maximumFractionDigits: 2
                                   })} className={`drop-shadow-lg shadow-gray-300 col-span-2 mb-4 w-max p-1`}/>
                    <CardMarketing prefix={`R$`} name="Orçamento Restante"
                                   content={(totalBudget - calculateTotalAllocation()).toLocaleString('pt-BR', {
                                       minimumFractionDigits: 2,
                                       maximumFractionDigits: 2
                                   })} className={`drop-shadow-lg shadow-gray-300 col-span-2 mb-4 w-max p-1`}/>
                </div>


            </div>
            <div className="flex flex-col">
                <div className="flex flex-row md:flex-col">
                    <h2 className="text-2xl font-bold tracking-tight">ORÇAMENTO POR CANAL</h2>
                </div>
                <div>
                        <nav>
                            <ul className="p-4 flex flex-col space-x-2 sm:flex-row">
                                {allocations?.map((metric) => (
                                    <li key={metric.id}>
                                    <Button
                                        onClick={() => handleCanalMetrics(metric)}
                                        className={`w-36 h-10 uppercase font-bold ${
                                            activeCanal === metric.canal
                                                ? "bg-oxfordBlue text-white hover:bg-lightBlue hover:text-oxfordBlue"
                                                : "text-oxfordBlue bg-lightBlue hover:bg-oxfordBlue hover:text-white"
                                        }`}
                                        type="submit">{metric.canal}
                                    </Button>
                                </li>
                                ))}
                            </ul>
                        </nav>

                </div>
            </div>
            <div className="flex flex-row space-x-5 p-3">
                           <span className="flex text-xs text-gray-500 mt-2">
                    <BadgeInfo className="mr-1 text-red-800" size={12}/> Selecione o canal no botão acima.
                </span>
                <span className="flex text-xs text-gray-500 mt-2">
                    <BadgeInfo className="mr-1 text-red-800" size={12}/> Clique no card para atualizar.
                </span>
            </div>

            <div className="flex flex-col space-x-5 sm:space-x-10 md:flex-row md:space-y-2">
                <div className="flex flex-col space-y-4">
                    <div className="grid grid-cols-2 gap-5 sm:grid-cols-2 md:grid-cols-2">
                        {!isEditing ? (
                            metrics.map((metric) => (
                                <div
                                    key={metric.value}
                                    className="h-max w-48 cursor-pointer transition-all duration-300 ease-in-out transform"
                                >
                                    <CardMarketing
                                        className="drop-shadow-lg shadow-gray-300"
                                        name={metric.name}
                                        prefix={metric.prefix}
                                        content={formatValue(metric.value)}
                                    />
                                </div>
                            ))
                        ) : (
                            <div className="col-span-full p-4">
                                <form onSubmit={handleSubmit}
                                      className="grid grid-cols-2 gap-5 sm:grid-cols-2">
                                    {metrics.map((metric) => (
                                        <Card key={metric.value} className="flex flex-col p-4 h-max w-52">
                                            <Label htmlFor={metric.value}
                                                   className="mb-2 font-bold text-base text-oxfordBlue">
                                                {metric.name}
                                            </Label>
                                            <Input
                                                id={metric.value}
                                                name={metric.value}
                                                type="text"
                                                onChange={handleInputChange}
                                                className="w-full"
                                            />
                                        </Card>
                                    ))}
                                </form>
                            </div>
                        )}
                    </div>
                    <div className="flex justify-center space-x-4">
                        {!isEditing ? (
                            <Button onClick={() => setIsEditing(true)}>Editar Métrica</Button>
                        ) : (
                            <>
                                <Button onClick={handleSubmit}>Salvar Alterações</Button>
                                <Button onClick={() => setIsEditing(false)}>Cancelar</Button>
                            </>
                        )}
                    </div>
                </div>
            <div className="mt-5 xl:mt-0 flex justify-center">
                <Card className="w-max p-4">
                    <CardTitle>
                        <p className="my-2 font-bold text-base text-oxfordBlue">Grafico de Distribuição</p>

                    </CardTitle>
                    <CardContent>
                        <Doughnut
                            data={chartData}
                            options={{
                                plugins: {
                                    tooltip: {
                                        callbacks: {
                                            label: function (context) {
                                                const label = context.label || '';
                                                const value = context.parsed || 0;
                                                const percentage = ((Number(value) / totalBudget) * 100).toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
                                                const formattedValue = `R$ ${value}`;
                                                return `${label}: ${formattedValue} (${percentage}%)`;
                                            }
                                        }
                                    },
                                    datalabels: {
                                        formatter: (value) => {
                                            if ((value / totalBudget * 100)) {
                                                return (value / totalBudget * 100).toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + "%"
                                            } else {
                                                return ''
                                            }
                                        },
                                        display: "block",
                                        backgroundColor: '#ECEAF8',
                                            color: '#051E32',
                                            borderRadius: 50,
                                            anchor: "center",
                                            font: {
                                                weight: 'bold',
                                                size: 12,
                                            },
                                            padding: 10
                                        },
                                        legend: {
                                            position: 'bottom',
                                            labels: {
                                                boxWidth: 15,
                                                padding: 12
                                            },
                                            display: true,
                                            align: 'center'
                                        }
                                    },
                                    layout: {
                                        padding: {
                                            bottom: 10
                                        }
                                    }
                                }}
                            />
                        </CardContent>
                    </Card>
                </div>
            </div>
            </div>
    )
}

export default AdminManageMarketing;