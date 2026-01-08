import classNames from "classnames";
import "./Weekbar.scss";

const Weekbar = () => {
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
			date: currentDate.toDateString(),
		});
	}

	return (
		<div className="weekbar">
			<div className="weekbar-container">
				{schedule.map((day, i) => {
					return (
						<div
							key={i}
							className={classNames("weekbar__day", {
								"weekbar__day--active": day.date === new Date().toDateString(),
							})}
						>
							{day.day}
						</div>
					);
				})}
			</div>
			<a className="weekbar__pdf" href="">
				Export PDF
			</a>
		</div>
	);
};

export default Weekbar;
