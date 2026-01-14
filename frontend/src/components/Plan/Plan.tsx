import { useEffect, useState } from "react";
import api from "../../axios";
import classNames from "classnames";
import StatusIndicator from "../StatusIndicator/StatusIndicator";
import ListTaskIcon from "../../icons/ListTaskIcon";
import "./Plan.scss";

const emptyInput = () => ({
	// TODO: LEARN THIS
	id: crypto.randomUUID(),
	task: "",
	executor: "",
	priority: "",
});

const Plan = ({ allUsers }) => {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [plan, setPlan] = useState([emptyInput(), emptyInput(), emptyInput()]);

	const handleAddInput = () => {
		setPlan((prev) => [...prev, emptyInput()]);
	};

	const handlePlanInput = (id, name, value) => {
		setPlan((prev) =>
			prev.map((item) => (item.id === id ? { ...item, [name]: value } : item))
		);
	};

	useEffect(() => {
		const fetchPlanData = async () => {
			setLoading(true);
			setError(null);

			try {
				const res = await api.get("/api/work/responsibilities/plan");

				const updated = res.data.map((item) => ({
					id: crypto.randomUUID(),
					task: item.task || "",
					executor: item.executor || "",
					priority: item.priority || "",
				}));

				setPlan(
					updated.length > 0
						? updated
						: [emptyInput(), emptyInput(), emptyInput()]
				);
			} catch (error) {
				setError(error);
			} finally {
				setLoading(false);
			}
		};

		fetchPlanData();
	}, []);

	const savePlanData = async (data) => {
		setError(null);

		// TODO: LEARN THIS
		for (const item of data) {
			if ((item.task && !item.executor) || (!item.task && item.executor)) {
				setError("Pokud vyplníte úkol, musíte uvést i řešitele (a naopak).");
				return;
			}
		}

		setLoading(true);

		try {
			// TODO: api won't run if custom error
			await api.put("/api/work/responsibilities/plan", data);
		} catch (err) {
			setError(err.message);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		if (plan.length >= 4) return;

		setPlan((prev) => {
			const updated = [...prev];

			while (updated.length < 3) {
				updated.push(emptyInput());
			}

			return updated;
		});
	}, [plan.length]);

	// TODO: learn this
	const removeItem = (id: string) => {
		setPlan((prev) => {
			const updated = prev.filter((item) => item.id !== id);
			savePlanData(updated);
			return updated;
		});
	};

	return (
		<section className="section">
			<div
				style={{
					display: "flex",
					justifyContent: "space-between",
				}}
			>
				<div className="container-title">
					<ListTaskIcon size={20} />
					<h2>Seznam úkolů / Plán na další dny</h2>
				</div>
				<button onClick={handleAddInput} className="responsibilities__btn">
					Pridat
				</button>
			</div>

			<div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
				{plan.map((item) => {
					return (
						<div key={item.id} style={{ display: "flex", gap: 5 }}>
							<input
								className="plan__input"
								type="text"
								name="task"
								onChange={(e) =>
									handlePlanInput(item.id, e.target.name, e.target.value)
								}
								value={item.task}
								placeholder="Vypracujte plán práce a vyberte zhotovitele."
								onBlur={() => savePlanData(plan)}
							/>
							<select
								className="plan__input"
								name="executor"
								id=""
								onChange={(e) =>
									handlePlanInput(item.id, e.target.name, e.target.value)
								}
								value={item.executor}
								onBlur={() => savePlanData(plan)}
							>
								<option value="">Not selected</option>
								{allUsers.map((user) => {
									return (
										<option key={user._id} value={user.name}>
											{user.name}
										</option>
									);
								})}
							</select>
							<select
								className={classNames("plan__input", {
									"priority--low": item.priority === "Nizká",
									"priority--medium": item.priority === "Střední",
									"priority--high": item.priority === "Vysoká",
								})}
								name="priority"
								id=""
								onChange={(e) =>
									handlePlanInput(item.id, e.target.name, e.target.value)
								}
								value={item.priority}
								onBlur={() => savePlanData(plan)}
							>
								<option style={{ background: "green" }} value="Nizká">
									Nizká
								</option>
								<option value="Střední">Střední</option>
								<option value="Vysoká">Vysoká</option>
							</select>
							<button
								onClick={() => removeItem(item.id)}
								className="plan__remove-btn"
							>
								X
							</button>
						</div>
					);
				})}
			</div>
			<StatusIndicator error={error} loading={loading} />
		</section>
	);
};

export default Plan;
