import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css'
import L from 'leaflet'
import 'leaflet-routing-machine'
import { GeoUtils } from '../lib/GeoUtils'
import { Button } from './ui/Button'
import { Navigation } from 'lucide-react'

// Fix generic Leaflet marker icon issue in React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

function RoutingMachine({ from, to, onRouteFound }) {
    const map = useMap()

    useEffect(() => {
        if (!map || !from || !to) return

        const routingControl = L.Routing.control({
            waypoints: [
                L.latLng(from.lat, from.lng),
                L.latLng(to.lat, to.lng)
            ],
            routeWhileDragging: false,
            addWaypoints: false,
            draggableWaypoints: false,
            fitSelectedRoutes: true,
            showAlternatives: false,
            lineOptions: {
                styles: [{ color: '#6FA1EC', weight: 4, dashArray: '10, 10' }]
            },
            router: L.Routing.osrmv1({
                serviceUrl: 'https://routing.openstreetmap.de/routed-foot/route/v1',
                profile: 'driving'
            })
        })
            .on('routesfound', function (e) {
                const routes = e.routes;
                const summary = routes[0].summary;
                // summary.totalDistance is in meters
                // summary.totalTime is in seconds
                if (onRouteFound) {
                    onRouteFound({
                        distance: summary.totalDistance,
                        time: summary.totalTime
                    })
                }
            })
            .addTo(map)

        return () => map.removeControl(routingControl)
    }, [map, from, to])

    return null
}

export function PropertyMap({ property }) {
    const [coords, setCoords] = useState(null)
    const [metroRoute, setMetroRoute] = useState(null)
    const [loading, setLoading] = useState(true)
    const [loadingRoute, setLoadingRoute] = useState(false)
    const [routeStats, setRouteStats] = useState(null)

    useEffect(() => {
        const loadLocation = async () => {
            if (property.lat && property.lng) {
                setCoords({ lat: property.lat, lng: property.lng })
                setLoading(false)
            } else if (property.address) {
                const found = await GeoUtils.geocodeAddress(property.address)
                if (found) {
                    setCoords(found)
                    // TODO: Optional - save back to DB to avoid re-fetching
                }
                setLoading(false)
            } else {
                setLoading(false)
            }
        }
        loadLocation()
    }, [property])

    const handleMetroRoute = async () => {
        if (!coords) return
        setLoadingRoute(true)
        setRouteStats(null)
        try {
            const station = await GeoUtils.findNearestMetro(coords.lat, coords.lng)
            if (station) {
                setMetroRoute(station)
            } else {
                alert("Nenhuma estação encontrada próxima (3km) ou serviço indisponível.")
            }
        } catch (e) {
            alert("Erro ao buscar rota.")
        } finally {
            setLoadingRoute(false)
        }
    }

    if (loading) return <div className="h-[300px] w-full bg-muted animate-pulse rounded-lg flex items-center justify-center">Carregando mapa...</div>
    if (!coords) return <div className="h-[300px] w-full bg-muted rounded-lg flex items-center justify-center text-muted-foreground">Endereço não localizado</div>

    return (
        <div className="space-y-2">
            <div className="relative h-[600px] w-full rounded-lg overflow-hidden border">
                <MapContainer center={[coords.lat, coords.lng]} zoom={15} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <Marker position={[coords.lat, coords.lng]}>
                        <Popup>
                            {property.title}
                        </Popup>
                    </Marker>

                    {metroRoute && (
                        <>
                            <Marker position={[metroRoute.lat, metroRoute.lng]}>
                                <Popup>{metroRoute.name}</Popup>
                            </Marker>
                            <RoutingMachine
                                from={coords}
                                to={metroRoute}
                                onRouteFound={setRouteStats}
                            />
                        </>
                    )}
                </MapContainer>

                {/* Route Stats Overlay */}
                {routeStats && (
                    <div className="absolute bottom-2 right-2 bg-background/90 backdrop-blur p-2 rounded shadow text-xs z-[1000] border">
                        <div className="font-semibold">Caminho a pé</div>
                        <div>📏 {routeStats.distance < 1000 ? `${Math.round(routeStats.distance)}m` : `${(routeStats.distance / 1000).toFixed(1)}km`}</div>
                        <div>⏱️ {Math.round(routeStats.time / 60)} min</div>
                    </div>
                )}
            </div>

            <Button
                size="sm"
                variant="outline"
                onClick={handleMetroRoute}
                className="w-full gap-2"
                disabled={loadingRoute || !!metroRoute}
            >
                <Navigation className={`h-4 w-4 ${loadingRoute ? 'animate-spin' : ''}`} />
                {loadingRoute ? "Buscando estação..." : metroRoute ? "Rota traçada" : "Caminho para o Metrô"}
            </Button>
        </div>
    )
}
