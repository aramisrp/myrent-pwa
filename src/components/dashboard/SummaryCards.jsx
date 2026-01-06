import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card"
import { Building2, TrendingUp, MapPin } from "lucide-react"

export function SummaryCards({ total, avgCost, visitedCount }) {
    const formatCurrency = (value) =>
        new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
            maximumFractionDigits: 0
        }).format(value)

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total de Imóveis</CardTitle>
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{total}</div>
                    <p className="text-xs text-muted-foreground">imóveis na lista de desejos</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Custo Médio</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(avgCost)}</div>
                    <p className="text-xs text-muted-foreground">por mês (total)</p>
                </CardContent>
            </Card>
            <Card className="col-span-2 md:col-span-1">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Imóveis Visitados</CardTitle>
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{visitedCount}</div>
                    <p className="text-xs text-muted-foreground">visitas realizadas</p>
                </CardContent>
            </Card>
        </div>
    )
}
