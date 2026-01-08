export default function timeToMinutes(time: string): number {
	if (!time) return 0;
	const [h, m] = time.split(":");
	return Number(h) * 60 + Number(m);
}
