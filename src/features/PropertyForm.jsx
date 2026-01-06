import { useState, useEffect } from "react"
import { useLiveQuery } from "dexie-react-hooks"
import { db } from "../db"
import { Button } from "../components/ui/Button"
import { Input } from "../components/ui/Input"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card"
import { Badge } from "../components/ui/Badge"
import { X } from "lucide-react"

const STATUS_OPTIONS = ["Interessado", "Visitado", "Descartado", "Alugado"]
const TAG_OPTIONS = ["Vaga", "Mobiliado", "Sol da Manhã", "Elevador", "Portaria 24h"]

export function PropertyForm({ onClose, propertyToEdit }) {
    const [formData, setFormData] = useState({
        title: "",
        address: "",
        rent_value: 0,
        condo_fee: 0,
        iptu: 0,
        status: "Interessado",
        tags: [],
        notes: ""
    })

    useEffect(() => {
        if (propertyToEdit) {
            setFormData(propertyToEdit)
        }
    }, [propertyToEdit])

    const totalCost = Number(formData.rent_value) + Number(formData.condo_fee) + Number(formData.iptu)

    const handleChange = (e) => {
        const { name, value, type } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: type === "number" ? Number(value) : value
        }))
    }

    const toggleTag = (tag) => {
        setFormData(prev => ({
            ...prev,
            tags: prev.tags.includes(tag)
                ? prev.tags.filter(t => t !== tag)
                : [...prev.tags, tag]
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            const dataToSave = {
                ...formData,
                total_cost: totalCost,
                created_at: propertyToEdit ? propertyToEdit.created_at : new Date()
            }

            if (propertyToEdit) {
                await db.properties.update(propertyToEdit.id, dataToSave)
            } else {
                await db.properties.add(dataToSave)
            }
            onClose()
        } catch (error) {
            console.error("Failed to save property:", error)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <label className="text-sm font-medium">Título</label>
                <Input name="title" value={formData.title} onChange={handleChange} required placeholder="Ex: Apê no Centro" />
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium">Endereço</label>
                <Input name="address" value={formData.address} onChange={handleChange} required placeholder="Rua, Bairro..." />
            </div>

            <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                    <label className="text-sm font-medium">Região</label>
                    <Input name="region" value={formData.region || ""} onChange={handleChange} placeholder="Ex: Asa Norte" />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium">Área (m²)</label>
                    <Input type="number" name="area" value={formData.area || ""} onChange={handleChange} placeholder="Ex: 60" />
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium">Link do Anúncio</label>
                <Input name="listing_url" value={formData.listing_url || ""} onChange={handleChange} placeholder="https://..." />
            </div>

            <div className="grid grid-cols-3 gap-2">
                <div className="space-y-2">
                    <label className="text-sm font-medium">Aluguel</label>
                    <Input type="number" name="rent_value" value={formData.rent_value} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium">Condomínio</label>
                    <Input type="number" name="condo_fee" value={formData.condo_fee} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium">IPTU</label>
                    <Input type="number" name="iptu" value={formData.iptu} onChange={handleChange} />
                </div>
            </div>

            <Card className="bg-muted/50">
                <CardContent className="p-4 flex justify-between items-center">
                    <span className="font-semibold">Total Mensal:</span>
                    <span className="text-xl font-bold text-primary">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalCost)}
                    </span>
                </CardContent>
            </Card>

            <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <div className="flex flex-wrap gap-2">
                    {STATUS_OPTIONS.map(status => (
                        <Badge
                            key={status}
                            variant={formData.status === status ? "default" : "outline"}
                            className="cursor-pointer"
                            onClick={() => setFormData(prev => ({ ...prev, status }))}
                        >
                            {status}
                        </Badge>
                    ))}
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium">Tags</label>
                <div className="flex flex-wrap gap-2">
                    {TAG_OPTIONS.map(tag => (
                        <Badge
                            key={tag}
                            variant={formData.tags.includes(tag) ? "secondary" : "outline"}
                            className="cursor-pointer"
                            onClick={() => toggleTag(tag)}
                        >
                            {tag}
                        </Badge>
                    ))}
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium">Notas</label>
                <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
            </div>

            <Button type="submit" className="w-full">Salvar Imóvel</Button>
        </form>
    )
}
