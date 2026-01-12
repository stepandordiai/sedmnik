import { useEffect, useState } from "react";
import axios from "axios";
import "./Responsibilities.scss";
import classNames from "classnames";
import ResponsibilityIcon from "../../icons/ResponsibilityIcon";

const weekData = [
	"Pondělí",
	"Úterý",
	"Středa",
	"Čtvrtek",
	"Pátek",
	"Sobota",
	"Neděle",
];

const emptyInput = () => ({
	// TODO: LEARN THIS
	id: crypto.randomUUID(),
	task: "",
	time: "",
});

const Responsibilities = ({ shiftDate, userId, currentUser, isWeek }) => {
	// TODO: LEARN THIS
	const [list, setList] = useState([emptyInput(), emptyInput()]);
	const [error, setError] = useState(null);
	const [loading, setLoading] = useState(false);
	const [weekList, setWeekList] = useState([]);

	// Move schedule calculation inside component or make it a dependency
	const [schedule, setSchedule] = useState([]);

	useEffect(() => {
		// Calculate schedule
		const today = new Date();
		const dayOfWeek = today.getDay();
		const diffToMonday =
			today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
		const monday = new Date(today.setDate(diffToMonday));

		const newSchedule = [];
		for (let i = 0; i < 7; i++) {
			const currentDate = new Date(monday);
			currentDate.setDate(monday.getDate() + i);

			newSchedule.push({
				day: weekData[i],
				date: currentDate.toISOString().split("T")[0],
			});
		}

		setSchedule(newSchedule);
	}, []);

	useEffect(() => {
		if (!Array.isArray(schedule) || schedule.length === 0) return;
		setWeekList([]);

		const fetchWeekResponsibilities = async () => {
			setLoading(true);
			const token = localStorage.getItem("token");

			try {
				const dates = schedule.map((d) => d.date);
				const res = await axios.get(
					`${import.meta.env.VITE_API_URL}/api/work/responsibilities/week`,
					{
						params: {
							userId,
							dates,
						},
						paramsSerializer: {
							indexes: null,
						},
						headers: { Authorization: `Bearer ${token}` },
					}
				);

				console.log("Received data:", res.data); // Debug log
				setWeekList(res.data);
			} catch (error) {
				console.error("Fetch error:", error);
				setError(error);
			} finally {
				setLoading(false);
			}
		};

		fetchWeekResponsibilities();
	}, [schedule, userId, list]);

	// const today = new Date();
	// const dayOfWeek = today.getDay();
	// const diffToMonday = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
	// const monday = new Date(today.setDate(diffToMonday));

	// const schedule = [];

	// for (let i = 0; i < 7; i++) {
	// 	const currentDate = new Date(monday);
	// 	currentDate.setDate(monday.getDate() + i);

	// 	schedule.push({
	// 		day: weekData[i],
	// 		date: currentDate.toISOString().split("T")[0],
	// 	});
	// }

	useEffect(() => {
		setList([emptyInput(), emptyInput()]);

		const fetchResponsibilities = async (date: string) => {
			setLoading(true);
			const token = localStorage.getItem("token");
			try {
				const res = await axios.get(
					`${
						import.meta.env.VITE_API_URL
					}/api/work/responsibilities/${date}?userId=${userId}`,
					{
						headers: { Authorization: `Bearer ${token}` },
					}
				);
				const hydrated = (res.data.responsibilities || []).map((item) => ({
					id: crypto.randomUUID(),
					task: item.task,
					time: item.time,
				}));

				setList(
					hydrated.length > 1
						? hydrated
						: hydrated.length === 1
						? [...hydrated, emptyInput()]
						: isWeek
						? [emptyInput(), emptyInput(), emptyInput(), emptyInput()]
						: [emptyInput(), emptyInput()]
				);
			} catch (error) {
				setError(error);
			} finally {
				setLoading(false);
			}
		};

		fetchResponsibilities(shiftDate);
	}, [shiftDate, userId, isWeek]);

	useEffect(() => {
		if (list.length === 0) setList([emptyInput()]);
	}, [list]);

	const handleAddInput = () => {
		setList((prev) => [...prev, emptyInput()]);
	};

	const handleChangeInput = (id, name, value) => {
		setList((prev) =>
			// TODO: learn this
			prev.map((item) => (item.id === id ? { ...item, [name]: value } : item))
		);
	};

	const handleWeekListInput = (date, index, name, value) => {
		setWeekList((prev) =>
			prev.map((d) => {
				if (d.date !== date) return d;

				const newResponsibilities = [...d.responsibilities];
				// ensure index exists
				if (!newResponsibilities[index])
					newResponsibilities[index] = { task: "", time: "" };
				newResponsibilities[index] = {
					...newResponsibilities[index],
					[name]: value,
				};

				return { ...d, responsibilities: newResponsibilities };
			})
		);
	};

	const saveWeekData = async () => {
		setLoading(true);
		const token = localStorage.getItem("token");
		// ✅ Prepare payload for backend
		const payload = weekList.map((day) => ({
			date: day.date,
			responsibilities: (day.responsibilities || [])
				.map((item) => ({
					task: item.task.trim(),
					time: item.time,
				}))
				.filter((item) => item.task || item.time), // optional: remove empty tasks
		}));

		try {
			await axios.put(
				`${import.meta.env.VITE_API_URL}/api/work/responsibilities/week`,
				{ weekList: payload }, // backend expects { weekList: [...] }
				{
					headers: { Authorization: `Bearer ${token}` },
				}
			);
		} catch (error) {
			setError(error);
		} finally {
			setLoading(false);
		}
	};

	const saveData = async (date: string) => {
		setLoading(true);
		const token = localStorage.getItem("token");
		const payload = {
			responsibilities: list
				.map((item) => ({
					task: item.task.trim(),
					time: item.time,
				}))
				.filter((item) => item.task),
		};

		try {
			await axios.put(
				`${import.meta.env.VITE_API_URL}/api/work/responsibilities/${date}`,
				payload,
				{
					headers: { Authorization: `Bearer ${token}` },
				}
			);
		} catch (error) {
			setError(error);
		} finally {
			setLoading(false);
		}
	};

	const status = (): string => {
		if (error) return error;
		if (loading) return "Aktualizace...";
		else return "Aktualizováno";
	};

	if (!currentUser) return <p>Loading...</p>; // wait for context to hydrate
	const canEdit = currentUser._id === userId;

	if (isWeek)
		return (
			<section className="week-section">
				<p style={{ marginBottom: 10, fontWeight: 600 }}>Tydenni report</p>
				<div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
					{weekList.map((day, index) => {
						const weekDay = schedule.find((d) => d.date == day.date);
						const ensureResponsibilities = (responsibilities) => {
							const arr = [...responsibilities];
							while (arr.length < 4) {
								arr.push({ task: "", time: "" });
							}
							return arr;
						};

						const filterItems = ensureResponsibilities(day.responsibilities);

						return (
							<div key={index} style={{ display: "flex", gap: 5 }}>
								<p
									className={classNames("week-section__title", {
										"week-section__title--active":
											day.date === new Date().toISOString().split("T")[0],
									})}
								>
									{weekDay.day}
								</p>
								<div
									style={{
										display: "flex",
										flexDirection: "column",
										gap: 5,
										flexGrow: 1,
									}}
								>
									{filterItems.map((item, index) => {
										return (
											<div key={index} className="week-section-input-container">
												<input
													onChange={(e) =>
														handleWeekListInput(
															day.date,
															index,
															e.target.name,
															e.target.value
														)
													}
													value={item.task}
													style={
														!canEdit
															? { background: "var(--bg-clr)" }
															: { background: "#fff" }
													}
													className="week-section__input"
													type="text"
													name="task"
													placeholder="Napište si své pracovní povinnosti"
													onBlur={saveWeekData}
													disabled={!canEdit}
												/>
												<input
													onChange={(e) =>
														handleWeekListInput(
															day.date,
															index,
															e.target.name,
															e.target.value
														)
													}
													value={item.time}
													style={
														!canEdit
															? { background: "var(--bg-clr)" }
															: { background: "#fff" }
													}
													className="week-section__input"
													type="time"
													name="time"
													onBlur={saveWeekData}
													disabled={!canEdit}
												/>
											</div>
										);
									})}
								</div>
							</div>
						);
					})}
				</div>
			</section>
		);

	return (
		<div className="responsibilities">
			<div
				style={{
					display: "flex",
					justifyContent: "space-between",
					marginBottom: 10,
				}}
			>
				<p
					style={{
						fontWeight: 600,
						display: "flex",
						alignItems: "center",
						gap: 5,
						marginBottom: 10,
					}}
				>
					<ResponsibilityIcon size={16} />
					Strucny popis prace
				</p>
				<button onClick={handleAddInput} className="responsibilities__btn">
					Pridat
				</button>
			</div>
			<div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
				{list.map((item) => {
					return (
						<div key={item.id} style={{ display: "flex", gap: 5 }}>
							<div className="responsibilities-input-container">
								<input
									onChange={(e) =>
										handleChangeInput(item.id, e.target.name, e.target.value)
									}
									value={item.task}
									className="responsibilities__input"
									style={
										!canEdit
											? { background: "var(--bg-clr)" }
											: { background: "#fff" }
									}
									type="text"
									name="task"
									placeholder="Napište si své pracovní povinnosti"
									onBlur={() => saveData(shiftDate)}
									disabled={!canEdit}
								/>
							</div>
							<div className="responsibilities-input-container">
								<input
									onChange={(e) =>
										handleChangeInput(item.id, e.target.name, e.target.value)
									}
									value={item.time}
									className="responsibilities__input"
									style={
										!canEdit
											? { background: "var(--bg-clr)" }
											: { background: "#fff" }
									}
									type="time"
									name="time"
									id="djfufu"
									onBlur={() => saveData(shiftDate)}
									disabled={!canEdit}
								/>
							</div>
						</div>
					);
				})}
			</div>
			<p
				style={{
					display: "flex",
					justifyContent: "flex-start",
					alignItems: "center",
					gap: 5,
					marginTop: 10,
				}}
			>
				<span
					className={`visit__status-indicator ${
						loading ? "status--loading" : error ? "status--error" : "status--ok"
					}`}
				></span>
				<span style={{ fontSize: "0.8rem" }}>{status()}</span>
			</p>
		</div>
	);
};

export default Responsibilities;
