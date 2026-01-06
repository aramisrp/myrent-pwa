import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'

export function StatusChart({ data }) {
    // data format: [{ name: 'Interessado', value: 10 }, ...]

    const COLORS = {
        'Interessado': '#3b82f6', // blue-500
        'Visitado': '#f59e0b', // amber-500
        'Descartado': '#ef4444', // red-500
        'Alugado': '#22c55e', // green-500
    }

    return (
        <Card className="col-span-1">
            <CardHeader>
                <CardTitle>Funil de Decisão</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[200px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[entry.name] || '#94a3b8'} />
                                ))}
                            </Pie>
                            <Tooltip
                                formatter={(value) => [value, 'Imóveis']}
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            />
                            <Legend verticalAlign="bottom" height={36} iconType="circle" />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )
}
