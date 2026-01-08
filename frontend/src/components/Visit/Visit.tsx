import ClockIcon from "../../icons/ClockIcon";
import { useEffect, useState } from "react";
import timeToMinutes from "../../utils/timeToMinutes";
import axios from "axios";
import "./Visit.scss";
import { useParams } from "react-router-dom";

// const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

const Visit = ({ userId, currentUser }) => {
	const { id } = useParams();

	const [data, setData] = useState(null);
	const [startTime, setStartTime] = useState("");
	const [endTime, setEndTime] = useState("");
	const [pauseTime, setPauseTime] = useState("");
	const [total, setTotal] = useState("00:00");
	const [error, setError] = useState(null);
	const today = new Date();

	const [shiftDate, setShiftDate] = useState(today.toISOString().split("T")[0]);

	// FIXME:
	console.log(error);

	useEffect(() => {
		setStartTime("");
		setEndTime("");
		setPauseTime("");
		setTotal("00:00");

		const fetchWorkShift = async () => {
			try {
				const token = localStorage.getItem("token");
				const response = await axios.get(
					`https://weekly-planner-backend.onrender.com/api/work/${shiftDate}?userId=${userId}`,
					{
						headers: {
							Authorization: `Bearer ${token}`,
						},
					}
				);

				setData(response.data);
			} catch (err: any) {
				// If 404, treat as empty shift
				if (err.response?.status === 404) {
					setData({ startTime: "", endTime: "", pauseTime: "" });
				} else {
					setError(err.response?.data?.message || "Something went wrong");
				}
			}
		};

		fetchWorkShift();
	}, [userId, shiftDate]);

	useEffect(() => {
		if (!data) return;
		setStartTime(data.startTime ?? "");
		setEndTime(data.endTime ?? "");
		setPauseTime(data.pauseTime ?? "");
		setTotal("00:00");
	}, [data]);

	useEffect(() => {
		if (startTime && endTime) {
			const start = timeToMinutes(startTime);
			const end = timeToMinutes(endTime);
			const pause = timeToMinutes(pauseTime);

			const hours = Math.floor((end - start - pause) / 60);
			const minutes = (end - start - pause) % 60;

			setTotal(hours + ":" + minutes.toString().padStart(2, "0"));
		} else {
			setTotal("00:00");
		}
	}, [startTime, endTime, pauseTime, shiftDate]);

	useEffect(() => {
		// Only auto-save if at least one input has a value
		if (!startTime && !endTime && !pauseTime) return;
		const upsertWorkShift = async () => {
			try {
				const token = localStorage.getItem("token");

				const response = await axios.post(
					"https://weekly-planner-backend.onrender.com/api/work",
					{
						date: shiftDate,
						startTime,
						endTime,
						pauseTime,
					},
					{
						headers: {
							Authorization: `Bearer ${token}`, // <--- this is correct
							"Content-Type": "application/json",
						},
					}
				);

				console.log(response.data);
			} catch (err: any) {
				const message = err.response?.data?.message || "Something went wrong";
				setError(message);
				console.error("Full Error Object:", err.response);
			}
		};

		upsertWorkShift();
	}, [startTime, endTime, pauseTime]);

	if (!currentUser) return <p>Loading...</p>; // wait for context to hydrate
	const canEdit = currentUser._id === id;

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
							value={shiftDate}
							onChange={(e) => setShiftDate(e.target.value)}
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
							disabled={!canEdit}
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
							disabled={!canEdit}
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
							disabled={!canEdit}
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
