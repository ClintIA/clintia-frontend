import { useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import {days, months, years} from "@/lib/optionsFixed.ts";

export interface DateFilterProps {
    onFilterChange: (filters: {
        day?: number
        month?: number
        year?: number
    }) => void,
    selectedDate?: number,
    selectedYear?: number,
    selectedMonth?: number
}

export function LeadDateFilter({ onFilterChange, selectedDate, selectedYear, selectedMonth }: DateFilterProps) {
    const [day, setDay] = useState<string | undefined>(undefined)
    const [month, setMonth] = useState<string | undefined>(undefined)
    const [year, setYear] = useState<string | undefined>(undefined)

    const applyFilters = () => {
        const filters: { day?: number; month?: number; year?: number } = {}

        if (day) filters.day = Number.parseInt(day) || undefined
        if (month) filters.month = Number.parseInt(month) || undefined
        if (year) filters.year = Number.parseInt(year) || undefined
        onFilterChange(filters)
    }

    const clearFilters = () => {
        setDay(undefined)
        setMonth(undefined)
        setYear(undefined)
        onFilterChange({})
    }

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle className="text-lg flex justify-between items-center">
                    Filtros de Data
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="day-filter">Dia</Label>
                        <Select defaultValue={selectedDate?.toString()} value={day} onValueChange={setDay}>
                            <SelectTrigger id="day-filter">
                                <SelectValue placeholder="Selecione o dia" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos os dias</SelectItem>
                                {days.map((d) => (
                                    <SelectItem key={d} value={d.toString()}>
                                        {d}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="month-filter">Mês</Label>
                        <Select defaultValue={selectedMonth?.toString()}  value={month} onValueChange={setMonth}>
                            <SelectTrigger id="month-filter">
                                <SelectValue placeholder="Selecione o mês" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos os meses</SelectItem>
                                {months.map((m) => (
                                    <SelectItem key={m.value} value={m.value}>
                                        {m.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="hidden space-y-2">
                        <Label htmlFor="year-filter">Ano</Label>
                        <Select defaultValue={selectedYear?.toString()}  value={year} onValueChange={setYear}>
                            <SelectTrigger id="year-filter">
                                <SelectValue placeholder="Selecione o ano" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos os anos</SelectItem>
                                {years.map((y) => (
                                    <SelectItem key={y} value={y.toString()}>
                                        {y}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <div className="flex justify-center space-x-2">
                    <Button className="mt-4" onClick={applyFilters}>
                        Aplicar Filtros
                    </Button>
                    <Button className="mt-4" onClick={clearFilters} >
                        Limpar Filtros
                    </Button>
                </div>

            </CardContent>
        </Card>
    )
}

