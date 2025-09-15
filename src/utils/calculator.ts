import {Trip} from "@/types/Types";

export function sumTrips(trips: Trip[]): number {

  let sum = 0
  trips.forEach(trip => {
    sum += trip.distance_km
  })

  return Math.round(sum)
}
