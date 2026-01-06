import { useLiveQuery } from "dexie-react-hooks"
import { db } from "../db"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "../components/ui/Card"
import { Badge } from "../components/ui/Badge"
import { Button } from "../components/ui/Button"
import { Trash2, Edit, Map, ExternalLink } from "lucide-react"

export function PropertyList({ onEdit, onOpenMap, filterStatus }) {
    const properties = useLiveQuery(
        () => {
            if (filterStatus === "Todos") return db.properties.toArray()
            return db.properties.where("status").equals(filterStatus).toArray()
        },
        [filterStatus]
    )

    if (!properties) return <div>Carregando...</div>
    if (properties.length === 0) return <div className="text-center text-muted-foreground py-8">Nenhum imóvel encontrado.</div>

    const handleDelete = (id) => {
        if (confirm("Tem certeza que deseja excluir?")) {
            db.properties.delete(id)
        }
    }

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {properties.map(property => (
                <Card key={property.id}>
                    <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                            <CardTitle className="text-lg">{property.title}</CardTitle>
                            <Badge variant="outline">{property.status}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{property.address}</p>
                    </CardHeader>
                    <CardContent className="pb-2">
                        <div className="text-2xl font-bold">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(property.total_cost)}
                        </div>
                        <div className="flex flex-wrap gap-1 mt-2">
                            {property.tags.map(tag => (
                                <Badge key={tag} variant="secondary" className="text-[10px] px-1 py-0">{tag}</Badge>
                            ))}
                        </div>
                        {property.notes && (
                            <p className="text-xs text-muted-foreground mt-2 whitespace-pre-line border-t pt-2">
                                {property.notes}
                            </p>
                        )}
                    </CardContent>
                    <CardFooter className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => onEdit(property)}>
                            <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => onOpenMap(property)}>
                            <Map className="h-4 w-4" />
                        </Button>
                        {property.listing_url && (
                            <Button variant="ghost" size="sm" onClick={() => window.open(property.listing_url, '_blank')}>
                                <ExternalLink className="h-4 w-4" />
                            </Button>
                        )}
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(property.id)} className="text-destructive hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </CardFooter>
                </Card>
            ))}
        </div>
    )
}
