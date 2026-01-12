import { useEffect, useState } from "react";
import "./Plan.scss";
import axios from "axios";

const emptyInput = () => ({
	// TODO: LEARN THIS
	id: crypto.randomUUID(),
	task: "",
	executor: "",
	priority: "",
});

const Plan = ({ allUsers }) => {
	const [plan, setPlan] = useState([emptyInput(), emptyInput(), emptyInput()]);
	const [error, setError] = useState(null);

	const handleAddInput = () => {
		setPlan((prev) => [...prev, emptyInput()]);
	};

	const handlePlanInput = (id, name, value) => {
		setPlan((prev) =>
			prev.map((item) => (item.id === id ? { ...item, [name]: value } : item))
		);
	};

	console.log(plan);

	useEffect(() => {
		const fetchPlanData = () => {};
	}, []);

	const savePlanData = async () => {
		const token = localStorage.getItem("token");

		try {
			await axios.put(
				`${import.meta.env.VITE_API_URL}/api/work/responsibilities/plan`,
				plan,
				{
					headers: { Authorization: `Bearer ${token}` },
				}
			);
		} catch (error) {
			setError(error);
		}
	};

	return (
		<section className="plan">
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
					Strucny popis prace
				</p>
				<button onClick={handleAddInput} className="responsibilities__btn">
					Pridat
				</button>
			</div>

			<div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
				{plan.map((item) => {
					return (
						<div style={{ display: "flex", gap: 5 }}>
							<input
								className="plan__input"
								type="text"
								name="task"
								onChange={(e) =>
									handlePlanInput(item.id, e.target.name, e.target.value)
								}
								value={item.task}
							/>
							<select
								className="plan__input"
								name="executor"
								id=""
								onChange={(e) =>
									handlePlanInput(item.id, e.target.name, e.target.value)
								}
								value={item.executor}
							>
								<option value="">Not selected</option>
								{allUsers.map((user) => {
									return <option value={user.name}>{user.name}</option>;
								})}
							</select>
							<select
								className="plan__input"
								name="priority"
								id=""
								onChange={(e) =>
									handlePlanInput(item.id, e.target.name, e.target.value)
								}
								value={item.priority}
							>
								<option style={{ backgroundColor: "green" }} value="Nizká">
									Nizká
								</option>
								<option value="Střední">Střední</option>
								<option value="Vysoká">Vysoká</option>
							</select>
						</div>
					);
				})}
			</div>
		</section>
	);
};

export default Plan;
