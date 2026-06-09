export class DistanceUtils {
    static toRadians(value: number): number {
        return value * (Math.PI / 180);
    }

    static haversine(
        lat1: number,
        lon1: number,
        lat2: number,
        lon2: number,
    ): number {
        const R = 6371;

        const dLat = this.toRadians(lat2 - lat1);
        const dLon = this.toRadians(lon2 - lon1);

        const a =
            Math.sin(dLat / 2) ** 2 +
            Math.cos(this.toRadians(lat1)) *
            Math.cos(this.toRadians(lat2)) *
            Math.sin(dLon / 2) ** 2;

        const c = 2 * Math.atan2(
            Math.sqrt(a),
            Math.sqrt(1 - a),
        );

        return R * c;
    }
}