"use client"; // nécessaire pour useState, modale, etc.

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Trip } from "@/types/Types";
import { toCamelCase } from "@/lib/camelize";

type TripsByMonth = Record<string, Trip[]>;

export default function TrackerList() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [tripsByMonth, setTripsByMonth] = useState<TripsByMonth>({});
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    departureDateTime: "",
    origin: "",
    destination: "",
    distanceKm: "",
  });

  useEffect(() => {
    fetchTrips();
  }, []);

  async function fetchTrips() {
    setLoading(true);
    const { data, error } = await supabase
      .from("trips")
      .select("id, departure_date_time, origin, destination, distance_km")
      .order("departure_date_time", { ascending: false });

    if (error) {
      console.error(error);
      setLoading(false);
      return;
    }

    const tripsData: Trip[] = toCamelCase<Trip[]>(data);
    setTrips(tripsData);
    setTripsByMonth(groupByMonth(tripsData));
    setLoading(false);
  }

  function groupByMonth(trips: Trip[]) {
    return trips.reduce((acc: TripsByMonth, trip) => {
      const month = new Date(trip.departureDateTime).toLocaleString("default", {
        month: "long",
        year: "numeric",
      });
      if (!acc[month]) acc[month] = [];
      acc[month].push(trip);
      return acc;
    }, {});
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const { departureDateTime, origin, destination, distanceKm } = formData;
    const { data, error } = await supabase.from("trips").insert([
      {
        departure_date_time: departureDateTime,
        origin,
        destination,
        distance_km: parseFloat(distanceKm),
      },
    ]);

    if (error) {
      console.error(error);
      return;
    }

    setFormData({ departureDateTime: "", origin: "", destination: "", distanceKm: "" });
    setIsModalOpen(false);
    fetchTrips(); // refresh
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 sm:p-12 relative">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-800">Mes déplacements</h1>
        <p className="text-gray-500 mt-2">Liste regroupée par mois</p>
      </header>

      <main className="space-y-10">
        {loading ? (
          <p>Loading...</p>
        ) : (
          Object.entries(tripsByMonth).map(([month, monthTrips]) => (
            <section key={month}>
              <h2 className="text-2xl font-semibold text-gray-700 mb-4">{month}</h2>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {monthTrips.map((trip) => (
                  <div
                    key={trip.id}
                    className="bg-white rounded-2xl shadow-md p-6 hover:shadow-xl transition-shadow duration-300"
                  >
                    <h3 className="text-lg font-medium text-gray-700 mb-2">
                      {trip.origin} → {trip.destination}
                    </h3>
                    <p className="text-gray-500 mb-2">
                      {new Date(trip.departureDateTime).toLocaleDateString(undefined, {
                        weekday: "short",
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                    <p className="text-gray-600 font-medium">{trip.distanceKm} km</p>
                  </div>
                ))}
              </div>
            </section>
          ))
        )}
      </main>

      {/* Bouton + */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-8 right-8 bg-blue-500 text-white w-16 h-16 rounded-full text-3xl shadow-lg hover:bg-blue-600 transition-colors flex items-center justify-center"
      >
        +
      </button>

      {/* Modale */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-11/12 max-w-md relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl"
            >
              &times;
            </button>
            <h2 className="text-xl font-bold mb-4">Ajouter un déplacement</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="datetime-local"
                value={formData.departureDateTime}
                onChange={(e) => setFormData({ ...formData, departureDateTime: e.target.value })}
                className="w-full p-2 border rounded"
                required
              />
              <input
                type="text"
                placeholder="Origine"
                value={formData.origin}
                onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                className="w-full p-2 border rounded"
                required
              />
              <input
                type="text"
                placeholder="Destination"
                value={formData.destination}
                onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                className="w-full p-2 border rounded"
                required
              />
              <input
                type="number"
                placeholder="Distance (km)"
                step="0.01"
                value={formData.distanceKm}
                onChange={(e) => setFormData({ ...formData, distanceKm: e.target.value })}
                className="w-full p-2 border rounded"
                required
              />
              <button
                type="submit"
                className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition-colors"
              >
                Ajouter
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
