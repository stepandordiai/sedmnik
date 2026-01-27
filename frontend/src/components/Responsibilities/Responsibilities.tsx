import { useEffect, useState } from "react";
import api from "../../axios";
import timeToMinutes from "../../utils/timeToMinutes";
import classNames from "classnames";
import StatusIndicator from "../StatusIndicator/StatusIndicator";
import AutoGrowTextArea from "../AutoGrowTextArea/AutoGrowTextArea";
import ResponsibilityIcon from "../../icons/ResponsibilityIcon";
import "./Responsibilities.scss";
import PlusIconSmall from "../../icons/PlusIconSmall";

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
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [list, setList] = useState([emptyInput(), emptyInput()]);
	const [weekList, setWeekList] = useState([]);
	const [schedule, setSchedule] = useState([]);

	// TODO: LEARN THIS
	useEffect(() => {
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
		const fetchResponsibilities = async (date: string) => {
			setLoading(true);
			setError(null);
			setList([emptyInput(), emptyInput()]);

			try {
				const res = await api.get(
					`/api/work/responsibilities/${date}?userId=${userId}`,
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
								: [emptyInput(), emptyInput()],
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
		if (!Array.isArray(schedule) || schedule.length === 0) return;

		const fetchWeekResponsibilities = async () => {
			setLoading(true);
			setError(null);
			setWeekList([]);

			try {
				const dates = schedule.map((d) => d.date);
				const res = await api.get("/api/work/responsibilities/week", {
					params: {
						userId,
						dates,
					},
					paramsSerializer: {
						indexes: null,
					},
				});

				setWeekList(res.data);
			} catch (err) {
				setError(err.message);
			} finally {
				setLoading(false);
			}
		};

		fetchWeekResponsibilities();
	}, [schedule, userId]);

	const handleChangeInput = (id, name, value) => {
		setList((prev) =>
			// TODO: learn this
			prev.map((item) => (item.id === id ? { ...item, [name]: value } : item)),
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
			}),
		);
	};

	const saveData = async () => {
		setLoading(true);
		const payload = {
			responsibilities: list
				.map((item) => ({
					task: item.task.trim(),
					time: item.time,
				}))
				.filter((item) => item.task),
		};

		try {
			await api.put(`/api/work/responsibilities/${shiftDate}`, payload);
		} catch (err) {
			setError(err.message);
		} finally {
			setLoading(false);
		}
	};

	const saveWeekData = async () => {
		setLoading(true);
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
			await api.put(
				"/api/work/responsibilities/week",
				{ weekList: payload }, // backend expects { weekList: [...] }
			);
		} catch (err) {
			setError(err.message);
		} finally {
			setLoading(false);
		}
	};

	const handleAddInput = () => {
		setList((prev) => [...prev, emptyInput()]);
	};

	const totalTime = list.reduce(
		(acc, item) => acc + timeToMinutes(item.time),
		0,
	);

	const totalTimeFixed = `${Math.floor(totalTime / 60)
		.toString()
		.padStart(2, "0")}:${Math.floor(totalTime % 60)
		.toString()
		.padStart(2, "0")}`;

	if (!currentUser) return;

	const canEdit = currentUser._id === userId;

	if (isWeek)
		return (
			<>
				<section className="section">
					<div className="container-title">
						<ResponsibilityIcon size={20} />
						<h2>Týdenní report</h2>
					</div>
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
												<div
													key={index}
													className="week-section-input-container"
												>
													<AutoGrowTextArea
														value={item.task}
														handleChange={(e) =>
															handleWeekListInput(
																day.date,
																index,
																e.target.name,
																e.target.value,
															)
														}
														name={"task"}
														holder={"Napište si své pracovní povinnosti"}
														blur={saveWeekData}
														disable={!canEdit}
														customStyle={
															!canEdit
																? { background: "var(--bg-clr)" }
																: { background: "#fff" }
														}
													/>
													<input
														onChange={(e) =>
															handleWeekListInput(
																day.date,
																index,
																e.target.name,
																e.target.value,
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
					<StatusIndicator error={error} loading={loading} />
				</section>
			</>
		);

	return (
		<section className="section">
			<div
				style={{
					display: "flex",
					justifyContent: "space-between",
				}}
			>
				<div className="container-title">
					<ResponsibilityIcon size={20} />
					<h2>Stručný popis práce</h2>
				</div>
			</div>
			<div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
				{list.map((item) => {
					return (
						<div key={item.id} style={{ display: "flex", gap: 5 }}>
							<div className="responsibilities-input-container">
								<AutoGrowTextArea
									value={item.task}
									handleChange={(e) =>
										handleChangeInput(item.id, e.target.name, e.target.value)
									}
									name={"task"}
									holder={"Napište si své pracovní povinnosti"}
									blur={saveData}
									disable={!canEdit}
									customStyle={
										!canEdit
											? { background: "var(--bg-clr)" }
											: { background: "#fff" }
									}
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
									onBlur={saveData}
									disabled={!canEdit}
								/>
							</div>
						</div>
					);
				})}
				<div
					style={{
						display: "flex",
						alignItems: "flex-end",
						flexDirection: "column",
					}}
				>
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
						{totalTimeFixed}
					</p>
				</div>
			</div>

			<button onClick={handleAddInput} className="responsibilities__btn">
				<PlusIconSmall /> <span>Přidat</span>
			</button>
			<StatusIndicator error={error} loading={loading} />
		</section>
	);
};

export default Responsibilities;
