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
	const [modalOpen, setModalOpen] = useState(false);
	const [selectedId, setSelectedId] = useState<string | null>(null);

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

	const removeItem = () => {
		if (selectedId) {
			setPlan((prev) => {
				const updated = prev.filter((item) => item.id !== selectedId);
				savePlanData(updated);
				return updated;
			});
		}
		setSelectedId(null);
		setModalOpen(false);
	};

	return (
		<>
			<div
				className={classNames("header-modal", {
					"header-modal--visible": modalOpen,
				})}
			>
				<p style={{ fontWeight: 600 }}>Opravdu chcete tuto položku smazat?</p>
				<button
					onClick={removeItem}
					style={{ background: "var(--red-clr)" }}
					className="header-modal__btn"
				>
					Smazat
				</button>
				<button
					style={{ background: "#000" }}
					className="header-modal__btn"
					onClick={() => {
						setSelectedId(null);
						setModalOpen(false);
					}}
				>
					Zrušit
				</button>
			</div>
			<div
				onClick={() => {
					setSelectedId(null);
					setModalOpen(false);
				}}
				className={classNames("header__curtain", {
					"header__curtain--visible": modalOpen,
				})}
			></div>
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
									disable={loading}
								/>
								<select
									className={classNames("plan__input", {
										"input--green": item.priority === "Nizká",
										"input--orange": item.priority === "Střední",
										"input--red": item.priority === "Vysoká",
										"select--disabled": loading,
									})}
									name="priority"
									onChange={(e) =>
										handlePlanInput(item.id, e.target.name, e.target.value)
									}
									value={item.priority}
									onBlur={() => savePlanData(plan)}
									disabled={loading}
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
									onClick={() => {
										setSelectedId(item.id);
										setModalOpen(true);
									}}
									className={classNames("plan__remove-btn", {
										"btn--disabled": loading,
									})}
									disabled={loading}
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
		</>
	);
};

export default Plan;
