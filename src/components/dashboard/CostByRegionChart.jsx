import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card'

const REGION_COLORS = [
    "#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#0088fe", "#00C49F", "#FFBB28", "#FF8042"
]

export function CostByRegionChart({ data }) {
    return (
        <Card className="col-span-1 lg:col-span-2">
            <CardHeader>
                <CardTitle>Composição de Custo por Região (Média)</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="region" />
                        <YAxis
                            tickFormatter={(value) => `R$${value}`}
                        />
                        <Tooltip
                            formatter={(value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)}
                        />
                        <Legend />
                        <Bar dataKey="rent" name="Aluguel" stackId="a" fill="#8884d8" />
                        <Bar dataKey="condo" name="Condomínio" stackId="a" fill="#82ca9d" />
                        <Bar dataKey="iptu" name="IPTU" stackId="a" fill="#ffc658" />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    )
}
