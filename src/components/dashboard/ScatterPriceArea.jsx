import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Label, Legend } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card'

const COLORS = [
    "#8884d8", "#82ca9d", "#ffc658", "#ff7300", "#0088fe", "#00C49F", "#FFBB28", "#FF8042"
]

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        // payload[0].payload is the data object
        const data = payload[0].payload
        return (
            <div className="bg-popover border text-popover-foreground p-3 rounded shadow-md text-xs space-y-1">
                <p className="font-bold text-sm">{data.name}</p>
                <p className="text-muted-foreground">{data.address}</p>
                <div className="flex gap-2 mt-2">
                    <span className="font-semibold">Área:</span> {data.area} m²
                </div>
                <div className="flex gap-2">
                    <span className="font-semibold">Valor:</span>
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(data.price)}
                </div>
                <div className="text-[10px] text-muted-foreground uppercase mt-1 tracking-wider">
                    {data.region}
                </div>
            </div>
        )
    }
    return null
}

export function ScatterPriceArea({ data }) {
    // Group data by region to create separate series for color/legend
    const groupedData = data.reduce((acc, item) => {
        const region = item.region || "Outros"
        if (!acc[region]) acc[region] = []
        acc[region].push(item)
        return acc
    }, {})

    return (
        <Card className="col-span-1">
            <CardHeader>
                <CardTitle>Valor x Tamanho (por Região)</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                        <CartesianGrid />
                        <XAxis type="number" dataKey="area" name="Área" unit="m²">
                            <Label value="Área (m²)" offset={-10} position="insideBottom" />
                        </XAxis>
                        <YAxis type="number" dataKey="price" name="Preço Total" unit="R$">
                            <Label value="Preço Total (R$)" offset={-12} angle={-90} position="insideLeft" style={{ textAnchor: 'middle' }} />
                        </YAxis>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />

                        {Object.entries(groupedData).map(([region, regionData], index) => (
                            <Scatter
                                key={region}
                                name={region}
                                data={regionData}
                                fill={COLORS[index % COLORS.length]}
                                offset={-52}
                            />
                        ))}
                    </ScatterChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    )
}
