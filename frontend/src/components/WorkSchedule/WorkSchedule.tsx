import { useEffect, useState } from "react";
import api from "../../axios";
import StatusIndicator from "../StatusIndicator/StatusIndicator";
import PlusIconSmall from "../../icons/PlusIconSmall";
import AutoGrowTextArea from "../AutoGrowTextArea/AutoGrowTextArea";
import "./WorkSchedule.scss";

const workScheduleEmptyInput = () => ({
	id: crypto.randomUUID(),
	desc: "",
	start: "",
	finish: "",
	comment: "",
});

const WorkSchedule = ({ buildingId }) => {
	const [error, setError] = useState(null);
	const [loading, setLoading] = useState(false);
	const [workSchedule, setWorkSchedule] = useState([
		workScheduleEmptyInput(),
		workScheduleEmptyInput(),
		workScheduleEmptyInput(),
	]);

	const handleWorkSchedule = (id: string, name: string, value: string) => {
		setWorkSchedule((prev) =>
			prev.map((item) => (item.id === id ? { ...item, [name]: value } : item)),
		);
	};

	useEffect(() => {
		const fetchWorkSchedule = async () => {
			setLoading(true);
			setError(null);

			try {
				const res = await api.get(`/api/buildings/${buildingId}/work-schedule`);

				const updated = res.data.map((item) => ({
					id: crypto.randomUUID(),
					desc: item.desc,
					start: item.start,
					finish: item.finish,
					comment: item.comment,
				}));

				// TODO: learn this
				const filled = [...updated];

				while (filled.length < 3) {
					filled.push(workScheduleEmptyInput());
				}

				setWorkSchedule(filled);
			} catch (err) {
				setError(err.response.data.message);
			} finally {
				setLoading(false);
			}
		};

		fetchWorkSchedule();
	}, [buildingId]);

	const saveWorkSchedule = async () => {
		setLoading(true);
		setError(null);

		try {
			await api.put(`/api/buildings/${buildingId}/work-schedule`, workSchedule);
		} catch (err) {
			setError(err.response.data.message);
		} finally {
			setLoading(false);
		}
	};

	const addWorkSchedule = () =>
		setWorkSchedule((prev) => [...prev, workScheduleEmptyInput()]);

	return (
		<section className="section-table">
			<h2 style={{ margin: "5px 0 0 5px ", fontWeight: 600 }}>
				Časový harmonogram prací
			</h2>
			<table>
				<thead>
					<tr>
						<th>Popis etapy / činnosti</th>
						<th>Zahájeni</th>
						<th>Dokončeni</th>
						<th>Poznámky</th>
					</tr>
				</thead>
				<tbody>
					{workSchedule.map((item) => {
						return (
							<tr key={item.id}>
								<td style={{ width: "100%" }}>
									<AutoGrowTextArea
										value={item.desc}
										handleChange={(e) =>
											handleWorkSchedule(item.id, e.target.name, e.target.value)
										}
										name="desc"
										blur={saveWorkSchedule}
										disable={loading}
									/>
								</td>
								<td>
									<input
										onChange={(e) =>
											handleWorkSchedule(item.id, e.target.name, e.target.value)
										}
										className="input"
										name="start"
										value={item.start}
										type="date"
										onBlur={saveWorkSchedule}
									/>
								</td>
								<td>
									<input
										onChange={(e) =>
											handleWorkSchedule(item.id, e.target.name, e.target.value)
										}
										className="input"
										name="finish"
										value={item.finish}
										type="date"
										onBlur={saveWorkSchedule}
									/>
								</td>
								<td>
									<input
										onChange={(e) =>
											handleWorkSchedule(item.id, e.target.name, e.target.value)
										}
										className="input"
										name="comment"
										value={item.comment}
										type="text"
										onBlur={saveWorkSchedule}
									/>
								</td>
							</tr>
						);
					})}
				</tbody>
			</table>
			<button
				onClick={addWorkSchedule}
				style={{
					margin: "0 5px 0 0",
					display: "flex",
					justifyContent: "center",
					alignItems: "center",
					alignSelf: "flex-end",
				}}
				className="btn"
			>
				<PlusIconSmall />
				<span>Přidat</span>
			</button>
			<div style={{ margin: "0 0 5px 5px" }}>
				<StatusIndicator error={error} loading={loading} />
			</div>
		</section>
	);
};

export default WorkSchedule;
