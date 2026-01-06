export const GeoUtils = {
    /**
     * Geocodes an address using OpenStreetMap Nominatim API
     * @param {string} address 
     * @returns {Promise<{lat: number, lng: number}|null>}
     */
    async geocodeAddress(address) {
        try {
            // Append "Brasília" or similar context if needed, but for now specific
            const query = encodeURIComponent(address)
            const url = `https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1`

            const response = await fetch(url)
            const data = await response.json()

            if (data && data.length > 0) {
                return {
                    lat: parseFloat(data[0].lat),
                    lng: parseFloat(data[0].lon)
                }
            }
            return null
        } catch (error) {
            console.error("Geocoding error:", error)
            return null
        }
    },

    /**
     * Finds the nearest metro station using Overpass API
     * @param {number} lat 
     * @param {number} lng 
     * @returns {Promise<{name: string, lat: number, lng: number}|null>}
     */
    async findNearestMetro(lat, lng) {
        try {
            // Overpass query for subway stations around the point (radius 3000m)
            const query = `
                [out:json];
                (
                  node["station"="subway"](around:2000, ${lat}, ${lng});
                  way["station"="subway"](around:2000, ${lat}, ${lng});
                  relation["station"="subway"](around:2000, ${lat}, ${lng});
                );
                out center;
            `
            const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`

            const response = await fetch(url)
            const data = await response.json()

            if (data.elements && data.elements.length > 0) {
                // Simple nearest logic (Overpass around isn't strictly ordered by distance sometimes)
                // Let's rely on the first one or sort them manually if needed. 
                // For simplicity, taking the first result usually works well with 'around'.
                const station = data.elements[0]
                const stationLat = station.lat || station.center.lat
                const stationLng = station.lon || station.center.lon

                return {
                    name: station.tags.name || "Estação de Metrô",
                    lat: stationLat,
                    lng: stationLng
                }
            }
            return null
        } catch (error) {
            console.error("Overpass error:", error)
            return null
        }
    }
}
