import classNames from "classnames";
import "./Weekbar.scss";

// TODO: learn this
const toLocalDateString = (date: Date) => {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");
	return `${year}-${month}-${day}`;
};

const Weekbar = ({ shiftDate, setShiftDate, isWeek, setIsWeek }) => {
	const weekData = [
		"Pondělí",
		"Úterý",
		"Středa",
		"Čtvrtek",
		"Pátek",
		"Sobota",
		"Neděle",
	];

	const today = new Date();
	const dayOfWeek = today.getDay();
	const diffToMonday = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
	const monday = new Date(today.setDate(diffToMonday));

	const schedule = [];

	for (let i = 0; i < 7; i++) {
		const currentDate = new Date(monday);
		currentDate.setDate(monday.getDate() + i);

		schedule.push({
			day: weekData[i],
			date: toLocalDateString(currentDate),
		});
	}

	const handleWeekDay = (date, bool) => {
		setShiftDate(date);
		setIsWeek(bool);
	};

	return (
		<div className="weekbar">
			<div className="weekbar-container">
				<button
					onClick={() => setIsWeek(true)}
					className="weekbar__day"
					style={
						isWeek
							? {
									outline: "2px solid var(--accent-clr)",
									outlineOffset: "-2px",
								}
							: { outline: "none" }
					}
				>
					Týdenní
				</button>
				{schedule.map((day, i) => {
					return (
						<button
							key={i}
							onClick={() => handleWeekDay(day.date, false)}
							className={classNames("weekbar__day", {
								"weekbar__day--active":
									day.date === toLocalDateString(new Date()),
							})}
							style={
								shiftDate === day.date && !isWeek
									? {
											outline: "2px solid var(--accent-clr)",
											outlineOffset: "-2px",
										}
									: { outline: "none" }
							}
						>
							{day.day}
						</button>
					);
				})}
			</div>
		</div>
	);
};

export default Weekbar;
