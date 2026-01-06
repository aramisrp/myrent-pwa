import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, Cell, CartesianGrid } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card'

export function RegionChart({ data }) {
    // Sort data by count descending
    const sortedData = [...data].sort((a, b) => b.count - a.count)

    return (
        <Card className="col-span-1">
            <CardHeader>
                <CardTitle>Ofertas por Região</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={sortedData} layout="vertical" margin={{ left: 40 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                        <XAxis type="number" hide />
                        <YAxis
                            type="category"
                            dataKey="region"
                            tick={{ fontSize: 12 }}
                            width={100}
                        />
                        <Tooltip
                            cursor={{ fill: 'transparent' }}
                            contentStyle={{ borderRadius: '8px' }}
                        />
                        <Bar dataKey="count" name="Imóveis" fill="#8884d8" radius={[0, 4, 4, 0]}>
                            {sortedData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#8884d8' : '#82ca9d'} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    )
}
