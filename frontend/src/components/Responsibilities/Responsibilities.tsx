import { useEffect, useState } from "react";
import "./Responsibilities.scss";
import axios from "axios";

const emptyInput = () => ({
	// TODO: LEARN THIS
	id: crypto.randomUUID(),
	task: "",
	time: "",
});

const Responsibilities = ({ shiftDate, userId }) => {
	// TODO: LEARN THIS
	const [list, setList] = useState([emptyInput()]);

	useEffect(() => {
		const fetchResponsibilities = async (date: string) => {
			const token = localStorage.getItem("token");
			try {
				const res = await axios.get(
					`https://weekly-planner-backend.onrender.com/api/work/responsibilities/${date}?userId=${userId}`,
					{
						headers: { Authorization: `Bearer ${token}` },
					}
				);
				const hydrated = (res.data.responsibilities || []).map((item) => ({
					id: crypto.randomUUID(),
					task: item.task,
					time: item.time,
				}));

				setList(hydrated.length ? hydrated : [emptyInput()]);
			} catch (error) {
				console.log(error);
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
		const token = localStorage.getItem("token");
		const payload = {
			responsibilities: list
				.map((item) => ({
					task: item.task.trim(),
					time: item.time,
				}))
				.filter((item) => item.task),
		};

		await axios.put(
			`https://weekly-planner-backend.onrender.com/api/work/responsibilities/${date}`,
			payload,
			{
				headers: { Authorization: `Bearer ${token}` },
			}
		);
	};

	return (
		<div className="responsibilities">
			<div
				style={{
					display: "flex",
					justifyContent: "space-between",
					marginBottom: 10,
				}}
			>
				<p>Strucny popis prace</p>
				<button onClick={handleAddInput} className="responsibilities__btn">
					Pridat
				</button>
			</div>
			<div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
				{list.map((item) => {
					return (
						<div key={item.id} style={{ display: "flex", gap: 5 }}>
							<div className="responsibilities-input-container">
								{/* <p>Popis prace</p> */}
								<input
									onChange={(e) =>
										handleChangeInput(item.id, e.target.name, e.target.value)
									}
									className="responsibilities__input"
									key={item.id}
									type="text"
									name="task"
									value={item.task}
									placeholder="Write down your task"
									onBlur={() => saveData(shiftDate)}
								/>
							</div>
							<div className="responsibilities-input-container">
								{/* <label htmlFor="djfufu">Straveny cas</label> */}
								<input
									onChange={(e) =>
										handleChangeInput(item.id, e.target.name, e.target.value)
									}
									value={item.time}
									className="responsibilities__input"
									type="time"
									name="time"
									id="djfufu"
									onBlur={() => saveData(shiftDate)}
								/>
							</div>
							{/* <button
								onClick={() => handleRemoveInput(item.id)}
								disabled={list.length === 1}
							>
								Remove
							</button> */}
						</div>
					);
				})}
			</div>
		</div>
	);
};

export default Responsibilities;
