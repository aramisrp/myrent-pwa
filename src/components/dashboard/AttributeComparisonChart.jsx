import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card'

const COLORS = [
    "#8884d8", "#82ca9d", "#ffc658", "#ff7300", "#0088fe", "#00C49F"
]

// Custom Tooltip to show raw values instead of normalized 0-100 scores
const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-popover border text-popover-foreground p-2 rounded shadow-md text-xs">
                <p className="font-semibold mb-1">{label}</p>
                {payload.map((entry, index) => {
                    const rawValue = entry.payload.rawValues && entry.payload.rawValues[entry.name]
                        ? entry.payload.rawValues[entry.name]
                        : entry.value

                    let formattedValue = rawValue
                    if (label.includes("Aluguel")) formattedValue = `R$ ${rawValue.toFixed(0)}`
                    else if (label.includes("Área")) formattedValue = `${rawValue.toFixed(0)} m²`
                    else formattedValue = `${(rawValue * 100).toFixed(0)}%`

                    return (
                        <div key={index} className="flex items-center gap-2">
                            <span style={{ color: entry.color }}>●</span>
                            {entry.name}: {formattedValue}
                        </div>
                    )
                })}
            </div>
        )
    }
    return null
}

export function AttributeComparisonChart({ data }) {
    // Data structure expected:
    // [
    //   { attribute: "Aluguel", RegionA: 100 (norm), RegionB: 50 (norm), rawValues: { RegionA: 2000, RegionB: 1000 } },
    //   ...
    // ]

    // Extract region names from the first data point keys, excluding 'attribute' and 'rawValues'
    const regions = data.length > 0
        ? Object.keys(data[0]).filter(k => k !== 'attribute' && k !== 'rawValues' && k !== 'fullMark')
        : []

    return (
        <Card className="col-span-1 lg:col-span-2">
            <CardHeader>
                <CardTitle>Comparativo de Atributos por Região</CardTitle>
            </CardHeader>
            <CardContent className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="attribute" tick={{ fontSize: 12 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />

                        {regions.map((region, index) => (
                            <Radar
                                key={region}
                                name={region}
                                dataKey={region}
                                stroke={COLORS[index % COLORS.length]}
                                fill={COLORS[index % COLORS.length]}
                                fillOpacity={0.3}
                            />
                        ))}
                        <Legend />
                        <Tooltip content={<CustomTooltip />} />
                    </RadarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    )
}
