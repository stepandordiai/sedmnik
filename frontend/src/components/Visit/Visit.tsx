import { useEffect, useState } from "react";
import api from "../../axios";
import timeToMinutes from "../../utils/timeToMinutes";
import StatusIndicator from "../StatusIndicator/StatusIndicator";
import ClockIcon from "../../icons/ClockIcon";
import "./Visit.scss";

const Visit = ({ userId, currentUser, shiftDate, setShiftDate, isWeek }) => {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [data, setData] = useState({
		startTime: "",
		endTime: "",
		overTime: "",
		pauseTime: "",
	});
	const [total, setTotal] = useState("00:00");
	const [monthInput, setMonthInput] = useState(shiftDate.slice(0, 7));
	const [month, setMonth] = useState("00:00");

	useEffect(() => {
		const fetchWorkShift = async () => {
			setError(null);
			setLoading(true);
			setData({
				startTime: "",
				endTime: "",
				overTime: "",
				pauseTime: "",
			});
			setTotal("00:00");

			try {
				const res = await api.get(
					"/api/work",
					// }/api/work/${shiftDate}?userId=${userId}`,
					{
						params: { date: shiftDate, userId },
					},
				);

				setData({
					startTime: res.data.startTime || "",
					endTime: res.data.endTime || "",
					overTime: res.data.overTime || "",
					pauseTime: res.data.pauseTime || "",
				});
			} catch (error) {
				// If 404, treat as empty shift
				if (error.response?.status === 404) {
					setData({ startTime: "", endTime: "", overTime: "", pauseTime: "" });
				} else {
					setError(error.response?.data?.message || "Něco se pokazilo");
				}
			} finally {
				setLoading(false);
			}
		};

		fetchWorkShift();
	}, [userId, shiftDate]);

	useEffect(() => {
		if (data.startTime && data.endTime) {
			const start = timeToMinutes(data.startTime);
			const end = timeToMinutes(data.endTime);
			const over = timeToMinutes(data.overTime);
			const pause = timeToMinutes(data.pauseTime);

			const hours = Math.floor((end - start + over - pause) / 60);
			const minutes = (end - start + over - pause) % 60;

			setTotal(hours + ":" + minutes.toString().padStart(2, "0"));
		} else {
			setTotal("00:00");
		}
	}, [data, shiftDate]);

	const upsertWorkShift = async () => {
		setLoading(true);

		try {
			await api.post("/api/work", {
				date: shiftDate,
				startTime: data.startTime,
				endTime: data.endTime,
				overTime: data.overTime,
				pauseTime: data.pauseTime,
			});
		} catch (err) {
			const message = err.response?.data?.message || "Something went wrong";
			setError(message);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		const fetchMonthData = async () => {
			setLoading(true);
			setError(null);
			setMonth("00:00");

			try {
				const res = await api.get("/api/work/monthly", {
					params: { month: monthInput, userId },
				});

				setMonth(res.data);
			} catch (error) {
				setError(error.message);
			} finally {
				setLoading(false);
			}
		};

		fetchMonthData();
	}, [monthInput, userId]);

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
				<div className="container-title">
					<ClockIcon size={20} />
					<h2>Dochazka</h2>
				</div>
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
				<StatusIndicator error={error} loading={loading} />
			</section>
		);
	}

	return (
		<section className="section">
			<div className="container-title">
				<ClockIcon size={20} />
				<h2>Dochazka</h2>
			</div>
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
						<span>Přesčas</span>
						<input
							onChange={(e) => handleDataInput(e.target.name, e.target.value)}
							name="overTime"
							onBlur={upsertWorkShift}
							className="visit__input"
							style={
								!canEdit
									? { background: "var(--bg-clr)" }
									: { background: "#fff" }
							}
							value={data.overTime}
							disabled={!canEdit}
							type="time"
						/>
					</div>
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
