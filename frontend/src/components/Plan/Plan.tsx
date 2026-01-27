import { useEffect, useState } from "react";
import api from "../../axios";
import classNames from "classnames";
import StatusIndicator from "../StatusIndicator/StatusIndicator";
import ListTaskIcon from "../../icons/ListTaskIcon";
import AutoGrowTextArea from "../AutoGrowTextArea/AutoGrowTextArea";
import PlusIconSmall from "../../icons/PlusIconSmall";
import XIcon from "../../icons/XIcon";
import "./Plan.scss";

const emptyInput = () => ({
	// TODO: learn this
	id: crypto.randomUUID(),
	task: "",
	priority: "",
});

const Plan = ({ userId }) => {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [plan, setPlan] = useState([emptyInput(), emptyInput(), emptyInput()]);

	const handleAddInput = () => {
		setPlan((prev) => [...prev, emptyInput()]);
	};

	const handlePlanInput = (id, name, value) => {
		setPlan((prev) =>
			prev.map((item) => (item.id === id ? { ...item, [name]: value } : item)),
		);
	};

	useEffect(() => {
		const fetchPlanData = async () => {
			setLoading(true);
			setError(null);

			try {
				const res = await api.get("/api/work/responsibilities/plan", {
					params: { userId },
				});

				const updated = (res.data || []).map((item) => ({
					id: crypto.randomUUID(),
					task: item.task || "",
					priority: item.priority || "",
				}));

				setPlan(
					updated.length > 0
						? updated
						: [emptyInput(), emptyInput(), emptyInput()],
				);
			} catch (error) {
				setError(error);
			} finally {
				setLoading(false);
			}
		};

		fetchPlanData();
	}, [userId]);

	const savePlanData = async (data) => {
		setError(null);
		setLoading(true);

		try {
			await api.put("/api/work/responsibilities/plan", data, {
				params: { userId },
			});
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
			<div className="container-title">
				<ListTaskIcon size={20} />
				<h2>Seznam úkolů / Plán na další dny</h2>
			</div>
			<div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
				{plan.map((item) => {
					return (
						<div key={item.id} style={{ display: "flex", gap: 5 }}>
							<AutoGrowTextArea
								value={item.task}
								handleChange={(e) =>
									handlePlanInput(item.id, e.target.name, e.target.value)
								}
								name={"task"}
								holder={"Vypracujte plán práce a vyberte zhotovitele"}
								blur={() => savePlanData(plan)}
							/>
							<select
								className={classNames("plan__input", {
									"input--green": item.priority === "Nizká",
									"input--orange": item.priority === "Střední",
									"input--red": item.priority === "Vysoká",
								})}
								name="priority"
								id=""
								onChange={(e) =>
									handlePlanInput(item.id, e.target.name, e.target.value)
								}
								value={item.priority}
								onBlur={() => savePlanData(plan)}
							>
								<option value="">Nezvoleno</option>
								<option className="input--green" value="Nizká">
									Nizká
								</option>
								<option className="input--orange" value="Střední">
									Střední
								</option>
								<option className="input--red" value="Vysoká">
									Vysoká
								</option>
							</select>
							<button
								onClick={() => removeItem(item.id)}
								className="plan__remove-btn"
							>
								<XIcon />
							</button>
						</div>
					);
				})}
			</div>
			<button onClick={handleAddInput} className="responsibilities__btn">
				<PlusIconSmall />
				<span>Přidat</span>
			</button>
			<StatusIndicator error={error} loading={loading} />
		</section>
	);
};

export default Plan;
