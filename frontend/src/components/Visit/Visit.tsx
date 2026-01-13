import ClockIcon from "../../icons/ClockIcon";
import { useEffect, useState } from "react";
import timeToMinutes from "../../utils/timeToMinutes";
import axios from "axios";
import "./Visit.scss";
import StatusIndicator from "../StatusIndicator/StatusIndicator";

const Visit = ({ userId, currentUser, shiftDate, setShiftDate, isWeek }) => {
	const [data, setData] = useState({
		startTime: "",
		endTime: "",
		pauseTime: "",
	});

	const [total, setTotal] = useState("00:00");
	const [error, setError] = useState(null);
	const [loading, setLoading] = useState(false);

	const [monthInput, setMonthInput] = useState(shiftDate.slice(0, 7));

	const [month, setMonth] = useState("00:00");

	console.log(monthInput);

	useEffect(() => {
		const fetchWorkShift = async () => {
			setError(null);
			setLoading(true);
			setData({
				startTime: "",
				endTime: "",
				pauseTime: "",
			});
			setTotal("00:00");

			try {
				const token = localStorage.getItem("token");
				const res = await axios.get(
					`${import.meta.env.VITE_API_URL}/api/work`,
					// }/api/work/${shiftDate}?userId=${userId}`,
					{
						params: { date: shiftDate, userId },
						headers: {
							Authorization: `Bearer ${token}`,
						},
					}
				);

				setData({
					startTime: res.data.startTime || "",
					endTime: res.data.endTime || "",
					pauseTime: res.data.pauseTime || "",
				});
			} catch (error) {
				// If 404, treat as empty shift
				if (error.response?.status === 404) {
					setData({ startTime: "", endTime: "", pauseTime: "" });
				} else {
					setError(error.response?.data?.message || "Něco se pokazilo");
				}
			} finally {
				setLoading(false);
			}
		};

		fetchWorkShift();
	}, [userId, shiftDate]);

	// useEffect(() => {
	// 	if (!data) return;
	// 	setStartTime(data.startTime || "");
	// 	setEndTime(data.endTime || "");
	// 	setPauseTime(data.pauseTime || "");
	// 	setTotal("00:00");
	// }, [data]);

	useEffect(() => {
		if (data.startTime && data.endTime) {
			const start = timeToMinutes(data.startTime);
			const end = timeToMinutes(data.endTime);
			const pause = timeToMinutes(data.pauseTime);

			const hours = Math.floor((end - start - pause) / 60);
			const minutes = (end - start - pause) % 60;

			setTotal(hours + ":" + minutes.toString().padStart(2, "0"));
		} else {
			setTotal("00:00");
		}
	}, [data, shiftDate]);

	const upsertWorkShift = async () => {
		setLoading(true);
		const token = localStorage.getItem("token");
		try {
			await axios.post(
				`${import.meta.env.VITE_API_URL}/api/work`,
				{
					date: shiftDate,
					startTime: data.startTime,
					endTime: data.endTime,
					pauseTime: data.pauseTime,
				},
				{
					headers: {
						Authorization: `Bearer ${token}`,
						"Content-Type": "application/json",
					},
				}
			);
		} catch (err) {
			const message = err.response?.data?.message || "Something went wrong";
			setError(message);
		} finally {
			setLoading(false);
		}
	};

	// useEffect(() => {
	// 	// Only auto-save if at least one input has a value
	// 	if (!data.startTime && !data.endTime && !data.pauseTime) return;

	// 	const timeout = setTimeout(() => {
	// 		upsertWorkShift();
	// 	}, 1000);

	// 	return () => clearTimeout(timeout);
	// }, [data]);

	useEffect(() => {
		const fetchMonthData = async () => {
			setLoading(true);
			setError(null);

			try {
				const token = localStorage.getItem("token");

				const res = await axios.get(
					`${import.meta.env.VITE_API_URL}/api/work/monthly`,
					{
						params: { month: monthInput },
						headers: {
							Authorization: `Bearer ${token}`,
							"Content-Type": "application/json",
						},
						// This matches the <input type="month" /> value
					}
				);

				setMonth(res.data);
			} catch (error) {
				setError(error.message);
			} finally {
				setLoading(false);
			}
		};

		fetchMonthData();
	}, [monthInput]);

	const handleDataInput = (name, value) => {
		setData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	if (!currentUser) return <p>Loading...</p>; // wait for context to hydrate
	const canEdit = currentUser._id === userId;

	if (isWeek) {
		return (
			<section className="section">
				<p
					style={{
						fontWeight: 600,
						display: "flex",
						alignItems: "center",
						gap: 5,
						marginBottom: 10,
					}}
				>
					Docházka
				</p>
				<div
					style={{
						display: "flex",
						gap: 5,
						width: "max-content",
						marginLeft: "auto",
					}}
				>
					<div style={{ display: "flex", flexDirection: "column" }}>
						<label htmlFor="fudfugf">Datum</label>
						<input
							id="fudfugf"
							className="input"
							type="month"
							onChange={(e) => setMonthInput(e.target.value)}
							value={monthInput}
						/>
					</div>

					<div>
						<p>Odpracováno</p>
						<p
							style={{
								padding: 5,
								border: "var(--secondary-border)",
								borderRadius: 5,
								background: "var(--bg-clr)",
								textAlign: "center",
							}}
						>
							{month}
						</p>
					</div>
				</div>
			</section>
		);
	}

	return (
		<section className="section">
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
							onChange={(e) => handleDataInput(e.target.name, e.target.value)}
							name="startTime"
							onBlur={upsertWorkShift}
							value={data.startTime}
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
							onChange={(e) => handleDataInput(e.target.name, e.target.value)}
							name="endTime"
							onBlur={upsertWorkShift}
							className="visit__input"
							style={
								!canEdit
									? { background: "var(--bg-clr)" }
									: { background: "#fff" }
							}
							value={data.endTime}
							disabled={!canEdit}
							type="time"
						/>
					</div>
				</div>
				<div style={{ display: "flex", gap: 5 }}>
					<div className="visit-input-container">
						<span>Pause</span>
						<input
							onChange={(e) => handleDataInput(e.target.name, e.target.value)}
							name="pauseTime"
							onBlur={upsertWorkShift}
							className="visit__input"
							style={
								!canEdit
									? { background: "var(--bg-clr)" }
									: { background: "#fff" }
							}
							value={data.pauseTime}
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
		</section>
	);
};

export default Visit;
