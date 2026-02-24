export const capitalizeDay = (day: string) =>
	day?.charAt(0).toUpperCase() + day.slice(1);

// TODO: learn this
export const dateToDayName = (dateStr: string) => {
	const date = new Date(dateStr);
	return date.toLocaleDateString("cs-CZ", { weekday: "long" });
};

// TODO: learn this
export const extractNameInitials = (userName: string): string => {
	if (!userName) return "";

	const name = userName.trim().split(" ").filter(Boolean);

	const firstName = name[0].charAt(0) || "";
	const lastName = name[1].charAt(0) || "";

	return firstName + lastName;
};
