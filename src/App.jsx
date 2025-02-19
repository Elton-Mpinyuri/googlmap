import "./App.css";
import { MarkerClusterer } from "@googlemaps/markerclusterer";
import { useEffect, useRef, useState } from "react";

function App() {
        const mapRef = useRef(null);
        const mapInstance = useRef(null);
        const [currentLocation, setCurrentLocation] = useState(null);
        const [loadingLocation, setLoadingLocation] = useState(true);

        useEffect(() => {
                if ("geolocation" in navigator) {
                        navigator.geolocation.getCurrentPosition(
                                (position) => {
                                        const { latitude, longitude } = position.coords;
                                        setCurrentLocation({ lat: latitude, lng: longitude });
                                        setLoadingLocation(false);
                                },
                                (error) => {
                                        console.error("Error getting location: ", error);
                                        setLoadingLocation(false);
                                },
                                { timeout: 10000, maximumAge: 0, enableHighAccuracy: true }
                        );
                } else {
                        console.error("Geolocation not supported");
                        setLoadingLocation(false);
                }
        }, []);

        useEffect(() => {
                if (!currentLocation) return; // Ensure map initializes only when location is available

                const initializeMap = async () => {
                        const { Map, Marker, InfoWindow } = await google.maps.importLibrary("maps");

                        mapInstance.current = new Map(mapRef.current, {
                                center: currentLocation,
                                zoom: 14,
                                mapId: "DEMO_MAP_ID",
                        });

                        const { PlacesService } = await google.maps.importLibrary("places");
                        const service = new PlacesService(mapInstance.current);

                        service.nearbySearch(
                                {
                                        location: currentLocation,
                                        radius: 20000, // 20 km
                                        type: "gas_station",
                                },
                                (results, status) => {
                                        if (status === google.maps.places.PlacesServiceStatus.OK) {
                                                const markers = results.map((place, i) => {
                                                        return new google.maps.Marker({
                                                                position: place.geometry.location,
                                                                map: mapInstance.current,
                                                                title: place.name,
                                                        });
                                                });

                                                // Use MarkerClusterer to cluster markers
                                                new MarkerClusterer({ map: mapInstance.current, markers });
                                        } else {
                                                console.error("Error fetching nearby gas stations:", status);
                                        }
                                }
                        );
                };

                initializeMap();
        }, [currentLocation]); // Runs only when currentLocation is set

        if (loadingLocation) {
                return (
                        <div className="flex h-screen items-center justify-center bg-gray-900">
                                <div className="flex flex-col items-center gap-4">
                                        <div className="text-gray-400">Getting your location...</div>
                                        <div
                                                className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-white border-r-transparent"
                                                role="status"
                                        >
                                                <span className="sr-only">Loading...</span>
                                        </div>
                                </div>
                        </div>
                );
        }

        return (
                <div className="flex h-screen items-center justify-center bg-gray-900">
                        <div className="flex flex-col items-center gap-8 w-[90%] max-w-2xl">
                                <div className="flex flex-col gap-4 w-full mt-10">
                                        <div className="h-[500px] w-full rounded-lg overflow-hidden">
                                                <h1 className="text-3xl font-semibold text-white">Marker Clusters</h1>
                                                <div ref={mapRef} style={{ width: "100%", height: "100%" }}></div>
                                        </div>
                                </div>
                        </div>
                </div>
        );
}

export default App;
