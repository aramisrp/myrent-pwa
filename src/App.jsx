import { useState } from "react"
import { MainLayout } from "./layouts/MainLayout"
import { Dashboard } from "./features/Dashboard"
import { PropertyList } from "./features/PropertyList"
import { PropertyForm } from "./features/PropertyForm"
import { PropertyImport } from "./features/PropertyImport"
import { PropertyMap } from "./components/PropertyMap"
import { Modal } from "./components/ui/Modal"
import { FAB } from "./components/ui/FAB"
import { Badge } from "./components/ui/Badge"
import { Button } from "./components/ui/Button"
import { DataExport } from "./features/DataExport"

function App() {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isImportOpen, setIsImportOpen] = useState(false)
  const [editingProperty, setEditingProperty] = useState(null)
  const [mapProperty, setMapProperty] = useState(null)
  const [filterStatus, setFilterStatus] = useState("Todos")

  const handleEdit = (property) => {
    setEditingProperty(property)
    setIsFormOpen(true)
  }

  const handleCloseForm = () => {
    setIsFormOpen(false)
    setEditingProperty(null)
  }

  return (
    <MainLayout>
      <Dashboard />

      <div className="mb-4 flex gap-2 justify-between items-center">
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsImportOpen(true)}>
            Importar Planilha/Backup
          </Button>
          <DataExport />
        </div>
      </div>

      <div className="mb-4 flex gap-2 overflow-x-auto pb-2">
        {["Todos", "Interessado", "Visitado", "Descartado", "Alugado"].map(status => (
          <Badge
            key={status}
            variant={filterStatus === status ? "default" : "outline"}
            className="cursor-pointer whitespace-nowrap"
            onClick={() => setFilterStatus(status)}
          >
            {status}
          </Badge>
        ))}
      </div>

      <PropertyList onEdit={handleEdit} onOpenMap={setMapProperty} filterStatus={filterStatus} />

      <FAB onClick={() => setIsFormOpen(true)} />

      <Modal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        title="Importar Imóveis"
      >
        <PropertyImport
          onClose={() => setIsImportOpen(false)}
          onImportComplete={(message) => alert(message)}
        />
      </Modal>

      <Modal
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        title={editingProperty ? "Editar Imóvel" : "Novo Imóvel"}
      >
        <PropertyForm onClose={handleCloseForm} propertyToEdit={editingProperty} />
      </Modal>

      <Modal
        isOpen={!!mapProperty}
        onClose={() => setMapProperty(null)}
        title={mapProperty ? mapProperty.title : "Mapa"}
      >
        {mapProperty && <PropertyMap property={mapProperty} />}
      </Modal>
    </MainLayout>
  )
}

export default App
