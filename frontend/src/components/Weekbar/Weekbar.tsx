import classNames from "classnames";
import "./Weekbar.scss";

const Weekbar = ({ shiftDate, setShiftDate }) => {
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
			date: currentDate.toISOString().split("T")[0],
		});
	}

	return (
		<div className="weekbar">
			<a className="weekbar__pdf" href="">
				Export PDF
			</a>
			<div className="weekbar-container">
				{schedule.map((day, i) => {
					return (
						<button
							key={i}
							onClick={() => setShiftDate(day.date)}
							className={classNames("weekbar__day", {
								"weekbar__day--active":
									day.date === new Date().toISOString().split("T")[0],
							})}
							style={
								shiftDate === day.date
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
