import { useEffect, useState } from "react";
import axios from "axios";
import "./Responsibilities.scss";
import ResponsibilityIcon from "../../icons/ResponsibilityIcon";

const emptyInput = () => ({
	// TODO: LEARN THIS
	id: crypto.randomUUID(),
	task: "",
	time: "",
});

const Responsibilities = ({ shiftDate, userId, currentUser }) => {
	// TODO: LEARN THIS
	const [list, setList] = useState([emptyInput()]);
	const [error, setError] = useState(null);
	const [loading, setLoading] = useState(false);

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
						: [emptyInput(), emptyInput()]
				);
			} catch (error) {
				setError(error);
			} finally {
				setLoading(false);
			}
		};

		fetchResponsibilities(shiftDate);
	}, [shiftDate, userId]);

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
									className="responsibilities__input"
									style={
										!canEdit
											? { background: "var(--bg-clr)" }
											: { background: "#fff" }
									}
									type="text"
									name="task"
									value={item.task}
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
