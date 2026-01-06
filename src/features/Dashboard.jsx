import { useLiveQuery } from "dexie-react-hooks"
import { db } from "../db"
import { SummaryCards } from "../components/dashboard/SummaryCards"
import { StatusChart } from "../components/dashboard/StatusChart"
import { RegionChart } from "../components/dashboard/RegionChart"
import { ScatterPriceArea } from "../components/dashboard/ScatterPriceArea"
import { CostByRegionChart } from "../components/dashboard/CostByRegionChart"
import { AttributeComparisonChart } from "../components/dashboard/AttributeComparisonChart"

export function Dashboard() {
    const stats = useLiveQuery(async () => {
        const properties = await db.properties.toArray()

        // Basic Stats
        const total = properties.length

        // Averages
        const totals = properties.reduce((acc, curr) => ({
            rent: acc.rent + curr.rent_value,
            condo: acc.condo + curr.condo_fee,
            iptu: acc.iptu + curr.iptu,
            total: acc.total + curr.total_cost
        }), { rent: 0, condo: 0, iptu: 0, total: 0 })

        const avgCost = total > 0 ? totals.total / total : 0
        // const totalValue = totals.total
        const visitedCount = properties.filter(p => p.status === "Visitado").length

        // Charts Data
        const statusCounts = properties.reduce((acc, curr) => {
            acc[curr.status] = (acc[curr.status] || 0) + 1
            return acc
        }, {})
        const statusData = Object.entries(statusCounts).map(([name, value]) => ({ name, value }))

        const costData = total > 0 ? [{
            name: 'Média',
            aluguel: totals.rent / total,
            condominio: totals.condo / total,
            iptu: totals.iptu / total
        }] : []

        // Advanced Analytics Data
        // 1. Region Data
        const regionCounts = properties.reduce((acc, curr) => {
            const region = curr.region || "Não Informado"
            acc[region] = (acc[region] || 0) + 1
            return acc
        }, {})
        const regionData = Object.entries(regionCounts).map(([region, count]) => ({ region, count }))

        // 2. Scatter Data (Area x Price)
        const scatterData = properties
            .filter(p => p.area > 0 && p.total_cost > 0)
            .map(p => ({
                area: p.area,
                price: p.total_cost,
                name: p.title,
                region: p.region || "Outros",
                address: p.address
            }))

        // 4. Cost By Region (Refined)
        const regionMetrics = properties.reduce((acc, curr) => {
            const region = curr.region || "Outros"
            if (!acc[region]) {
                acc[region] = {
                    rent: 0, condo: 0, iptu: 0, count: 0,
                    area: 0, elevator: 0, apartment: 0, house: 0, metro: 0
                }
            }
            acc[region].rent += curr.rent_value || 0
            acc[region].condo += curr.condo_fee || 0
            acc[region].iptu += curr.iptu || 0
            acc[region].area += curr.area || 0
            acc[region].count += 1

            // Attribute counting
            const tags = (curr.tags || []).map(t => t.toLowerCase())
            const type = (curr.title || "").toLowerCase() // Fallback if type not separated

            if (tags.includes("elevador")) acc[region].elevator += 1
            if (tags.includes("apartamento") || type.includes("apartamento") || type.includes("apto")) acc[region].apartment += 1
            if (tags.includes("casa") || type.includes("casa")) acc[region].house += 1
            if (tags.includes("metrô") || tags.includes("metro")) acc[region].metro += 1

            return acc
        }, {})

        const costByRegionData = Object.entries(regionMetrics).map(([region, metrics]) => ({
            region,
            rent: metrics.rent / metrics.count,
            condo: metrics.condo / metrics.count,
            iptu: metrics.iptu / metrics.count
        }))

        // 5. Attribute Comparison (Radar - Normalized)
        // We need 6 axes: Aluguel, Área, Elevador, Apto, Casa, Metrô
        const radarAxes = [
            { key: 'rent', label: 'Aluguel (R$)' },
            { key: 'area', label: 'Área (m²)' },
            { key: 'elevator', label: 'Elevador (%)' },
            { key: 'apartment', label: 'Apartamento (%)' },
            { key: 'house', label: 'Casa (%)' },
            { key: 'metro', label: 'Metrô (%)' }
        ]

        // Calculate averages/percentages and find MAX for normalization
        const regionStats = Object.keys(regionMetrics).map(region => {
            const m = regionMetrics[region]
            return {
                region,
                rent: m.rent / m.count,
                area: m.area / m.count,
                elevator: m.elevator / m.count,
                apartment: m.apartment / m.count,
                house: m.house / m.count,
                metro: m.metro / m.count
            }
        })

        const maxValues = radarAxes.reduce((acc, axis) => {
            acc[axis.key] = Math.max(...regionStats.map(s => s[axis.key])) || 1 // Avoid div call 0
            return acc
        }, {})

        // Transform to Recharts Radar format: 
        // [ { attribute: "Aluguel", RegionA: 80, RegionB: 40, rawValues: {RegionA: 2000, RegionB: 1000} }, ... ]
        const attributeComparisonData = radarAxes.map(axis => {
            const dataPoint = { attribute: axis.label, rawValues: {} }
            regionStats.forEach(stat => {
                dataPoint[stat.region] = (stat[axis.key] / maxValues[axis.key]) * 100
                dataPoint.rawValues[stat.region] = stat[axis.key]
            })
            return dataPoint
        })

        // Insights
        const condoPercent = total > 0 ? (totals.condo / totals.total) * 100 : 0
        const insights = []
        if (condoPercent > 30) {
            insights.push({ type: 'warning', text: `Atenção: O condomínio representa ${condoPercent.toFixed(0)}% do custo médio.` })
        }
        if (total === 0) {
            insights.push({ type: 'info', text: "Adicione imóveis para ver insights." })
        }

        return {
            total, avgCost, visitedCount, statusData, costData,
            regionData, scatterData,
            costByRegionData, attributeComparisonData,
            insights
        }
    })

    if (!stats) return null

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <SummaryCards
                total={stats.total}
                avgCost={stats.avgCost}
                visitedCount={stats.visitedCount}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                <StatusChart data={stats.statusData} />
                <RegionChart data={stats.regionData} />

                <CostByRegionChart data={stats.costByRegionData} />
                <AttributeComparisonChart data={stats.attributeComparisonData} />

                <ScatterPriceArea data={stats.scatterData} />
            </div>

            {stats.insights.length > 0 && (
                <div className="bg-muted/50 p-4 rounded-lg border">
                    <h3 className="font-semibold text-sm mb-2">Insights da Carteira</h3>
                    <ul className="space-y-1">
                        {stats.insights.map((insight, idx) => (
                            <li key={idx} className="text-sm text-muted-foreground flex items-center gap-2">
                                <span className={`h-2 w-2 rounded-full ${insight.type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'}`} />
                                {insight.text}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    )
}
