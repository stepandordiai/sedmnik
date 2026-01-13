import ClockIcon from "../../icons/ClockIcon";
import { useEffect, useState } from "react";
import timeToMinutes from "../../utils/timeToMinutes";
import axios from "axios";
import "./Visit.scss";
import StatusIndicator from "../StatusIndicator/StatusIndicator";

const Visit = ({ userId, currentUser, shiftDate, setShiftDate }) => {
	const [data, setData] = useState(null);

	const [startTime, setStartTime] = useState("");
	const [endTime, setEndTime] = useState("");
	const [pauseTime, setPauseTime] = useState("");
	const [total, setTotal] = useState("00:00");
	const [error, setError] = useState(null);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		let isCurrentRequest = true;
		const fetchWorkShift = async () => {
			setError(null);
			setLoading(true);
			setStartTime("");
			setEndTime("");
			setPauseTime("");
			setTotal("00:00");
			try {
				const token = localStorage.getItem("token");
				const response = await axios.get(
					`${
						import.meta.env.VITE_API_URL
					}/api/work/${shiftDate}?userId=${userId}`,
					{
						headers: {
							Authorization: `Bearer ${token}`,
						},
					}
				);

				if (isCurrentRequest) {
					setData(response.data);
				}
			} catch (error) {
				// If 404, treat as empty shift
				if (isCurrentRequest) {
					if (error.response?.status === 404) {
						setData({ startTime: "", endTime: "", pauseTime: "" });
					} else {
						setError(error.response?.data?.message || "Něco se pokazilo");
					}
				}
			} finally {
				if (isCurrentRequest) setLoading(false);
			}
		};

		fetchWorkShift();

		return () => {
			isCurrentRequest = false;
		};
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

	const upsertWorkShift = async () => {
		setLoading(true);
		try {
			const token = localStorage.getItem("token");

			const response = await axios.post(
				`${import.meta.env.VITE_API_URL}/api/work`,
				{
					date: shiftDate,
					startTime,
					endTime,
					pauseTime,
				},
				{
					headers: {
						Authorization: `Bearer ${token}`,
						"Content-Type": "application/json",
					},
				}
			);

			console.log(response.data);
		} catch (err: any) {
			const message = err.response?.data?.message || "Something went wrong";
			setError(message);
			console.error("Full Error Object:", err.response);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		// Only auto-save if at least one input has a value
		if (!startTime && !endTime && !pauseTime) return;

		const timeout = setTimeout(() => {
			upsertWorkShift();
		}, 1000);

		return () => clearTimeout(timeout);
	}, [startTime, endTime, pauseTime]);

	if (!currentUser) return <p>Loading...</p>; // wait for context to hydrate
	const canEdit = currentUser._id === userId;

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
							className="visit__input"
							value={shiftDate}
							onChange={(e) => setShiftDate(e.target.value)}
							type="date"
						/>
					</div>
					<div className="visit-input-container">
						<span>Prichod</span>
						<input
							onChange={(e) => setStartTime(e.target.value)}
							onBlur={upsertWorkShift}
							value={startTime}
							className="visit__input"
							style={
								!canEdit
									? { background: "var(--bg-clr)" }
									: { background: "#fff" }
							}
							disabled={!canEdit}
							type="time"
						/>
					</div>
					<div className="visit-input-container">
						<span>Odchod</span>
						<input
							onChange={(e) => setEndTime(e.target.value)}
							onBlur={upsertWorkShift}
							className="visit__input"
							style={
								!canEdit
									? { background: "var(--bg-clr)" }
									: { background: "#fff" }
							}
							value={endTime}
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
							onBlur={upsertWorkShift}
							className="visit__input"
							style={
								!canEdit
									? { background: "var(--bg-clr)" }
									: { background: "#fff" }
							}
							value={pauseTime}
							disabled={!canEdit}
							type="time"
						/>
					</div>
					<div className="visit-input-container">
						<span>Odpracovano</span>
						<p
							style={{
								border: "var(--secondary-border)",
								background: "var(--bg-clr)",
								borderRadius: 5,
								padding: 5,
								textAlign: "center",
							}}
						>
							{total}
						</p>
					</div>
				</div>
			</div>
			<StatusIndicator loading={loading} error={error} />
		</div>
	);
};

export default Visit;
