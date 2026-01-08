import ClockIcon from "../../icons/ClockIcon";
import { useEffect, useState } from "react";
import timeToMinutes from "../../utils/timeToMinutes";
import "./Visit.scss";

const Visit = () => {
	const [startTime, setStartTime] = useState("");
	const [endTime, setEndTime] = useState("");
	const [pauseTime, setPauseTime] = useState("");
	const [total, setTotal] = useState("00:00");

	useEffect(() => {
		if (!startTime || !endTime) return;

		const start = timeToMinutes(startTime);
		const end = timeToMinutes(endTime);
		const pause = timeToMinutes(pauseTime);

		const hours = Math.floor((end - start - pause) / 60);
		const minutes = (end - start - pause) % 60;

		setTotal(hours + ":" + minutes.toString().padStart(2, "0"));
	}, [startTime, endTime, pauseTime]);

	const today = new Date();

	const dateString = today.toISOString().split("T")[0];

	return (
		<div className="visit">
			<p
				style={{
					fontWeight: 600,
					display: "flex",
					alignItems: "center",
					gap: 5,
					marginBottom: 10,
				}}
			>
				<ClockIcon size={16} />
				<span>Dochazka</span>
			</p>
			<div className="visit-container">
				<div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
					<div className="visit-input-container">
						<span>Datum</span>
						<input
							style={{
								border: "1px solid rgba(0, 0, 0, 0.2)",
								borderRadius: 10,
								padding: 5,
							}}
							defaultValue={dateString}
							type="date"
						/>
					</div>
					<div className="visit-input-container">
						<span>Prichod</span>
						<input
							onChange={(e) => setStartTime(e.target.value)}
							value={startTime}
							style={{
								border: "1px solid rgba(0, 0, 0, 0.2)",
								borderRadius: 10,
								padding: 5,
								textAlign: "center",
								minWidth: 80,
							}}
							type="time"
						/>
					</div>
					<div className="visit-input-container">
						<span>Odchod</span>
						<input
							onChange={(e) => setEndTime(e.target.value)}
							value={endTime}
							style={{
								border: "1px solid rgba(0, 0, 0, 0.2)",
								borderRadius: 10,
								padding: 5,
								textAlign: "center",
								minWidth: 80,
							}}
							type="time"
						/>
					</div>
				</div>
				<div style={{ display: "flex", gap: 5 }}>
					<div className="visit-input-container">
						<span>Pause</span>
						<input
							onChange={(e) => setPauseTime(e.target.value)}
							value={pauseTime}
							style={{
								border: "1px solid rgba(0, 0, 0, 0.2)",
								borderRadius: 10,
								padding: 5,
								textAlign: "center",
								minWidth: 80,
							}}
							type="time"
						/>
					</div>
					<div className="visit-input-container">
						<span>Odpracovano</span>
						<p
							style={{
								border: "1px solid rgba(0, 0, 0, 0.2)",
								background: "var(--bg-clr)",
								borderRadius: 10,
								padding: 5,
								textAlign: "center",
								minWidth: 80,
							}}
						>
							{total}
						</p>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Visit;
