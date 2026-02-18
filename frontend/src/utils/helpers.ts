export const capitalizeDay = (day: string) =>
	day?.charAt(0).toUpperCase() + day.slice(1);

// TODO: learn this
export const dateToDayName = (dateStr: string) => {
	const date = new Date(dateStr);
	return date.toLocaleDateString("cs-CZ", { weekday: "long" });
};
