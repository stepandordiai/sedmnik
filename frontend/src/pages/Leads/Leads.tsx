import { useEffect, useState } from "react";
import PersonIcon from "../../icons/PersonIcon";
import axios from "axios";
import StatusIndicator from "../../components/StatusIndicator/StatusIndicator";
import "./Leads.scss";

const emptyLeadRow = () => ({
	id: crypto.randomUUID(),
	name: "",
	tel: "",
	address: "",
	position: "",
	details: "",
	createdAt: "",
});

const Leads = () => {
	const [leads, setLeads] = useState([emptyLeadRow()]);
	const [error, setError] = useState(null);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		const getLeads = async () => {
			setLoading(true);
			setError(null);

			try {
				const res = await axios.get(
					`${import.meta.env.VITE_API_URL}/leads/all`,
				);

				const updated = res.data.map((lead) => ({
					id: crypto.randomUUID(),
					name: lead.name,
					tel: lead.tel,
					address: lead.address,
					position: lead.position,
					details: lead.details,
					createdAt: lead.createdAt,
				}));

				const filled = [...updated];

				while (filled.length < 1) {
					filled.push(emptyLeadRow());
				}

				setLeads(filled);
			} catch (err) {
				setError(error.response?.data.message);
			} finally {
				setLoading(false);
			}
		};

		getLeads();
	}, []);

	const saveLeads = async () => {
		const hasInvalidLead = leads.some((lead) => {
			const hasOtherData =
				(lead.name && lead.name.trim() !== "") ||
				(lead.address && lead.address.trim() !== "") ||
				(lead.position && lead.position.trim() !== "") ||
				(lead.details && lead.details.trim() !== "");

			return hasOtherData && (!lead.tel || lead.tel.trim() === "");
		});

		if (hasInvalidLead) {
			setError("Telefon je povinné pole");
			return;
		}

		setError(null);
		setLoading(true);

		try {
			const res = await axios.put(
				`${import.meta.env.VITE_API_URL}/leads`,
				leads,
			);

			const updated = res.data.map((lead) => ({
				id: crypto.randomUUID(),
				name: lead.name,
				tel: lead.tel,
				address: lead.address,
				position: lead.position,
				details: lead.details,
				createdAt: lead.createdAt,
			}));

			const filled = [...updated];

			while (filled.length < 1) {
				filled.push(emptyLeadRow());
			}
		} catch (err) {
			setError(err.response?.data.message);
		} finally {
			setLoading(false);
		}
	};

	const handleLeadsInput = (id, name, value) => {
		setLeads((prev) =>
			prev.map((lead) => (lead.id === id ? { ...lead, [name]: value } : lead)),
		);
	};

	return (
		<main className="main">
			<section className="section">
				<div className="container-title">
					<PersonIcon size={20} />
					<h2>Potenciální pracovníci</h2>
				</div>
				<table>
					<thead>
						<tr>
							<th>#</th>
							<th>Jmeno</th>
							<th>
								Telefon <span style={{ color: "#f00" }}>*</span>
							</th>
							<th>Adresa</th>
							<th>Pozice</th>
							<th>Poznamky</th>
							<th>Datum</th>
						</tr>
					</thead>
					<tbody>
						{leads.map((lead, i) => {
							return (
								<tr key={lead.id}>
									<td>{i + 1}</td>
									<td>
										<input
											onChange={(e) =>
												handleLeadsInput(lead.id, e.target.name, e.target.value)
											}
											value={lead.name}
											className="input"
											name="name"
											type="text"
											onBlur={saveLeads}
										/>
									</td>
									<td>
										<input
											onChange={(e) =>
												handleLeadsInput(lead.id, e.target.name, e.target.value)
											}
											name="tel"
											value={lead.tel}
											className="input"
											type="text"
											onBlur={saveLeads}
											required
										/>
									</td>
									<td>
										<input
											onChange={(e) =>
												handleLeadsInput(lead.id, e.target.name, e.target.value)
											}
											name="address"
											value={lead.address}
											className="input"
											type="text"
											onBlur={saveLeads}
										/>
									</td>
									<td>
										<input
											onChange={(e) =>
												handleLeadsInput(lead.id, e.target.name, e.target.value)
											}
											name="position"
											value={lead.position}
											className="input"
											type="text"
											onBlur={saveLeads}
										/>
									</td>
									<td>
										<input
											onChange={(e) =>
												handleLeadsInput(lead.id, e.target.name, e.target.value)
											}
											name="details"
											value={lead.details}
											className="input"
											type="text"
											onBlur={saveLeads}
										/>
									</td>
									<td>{lead.createdAt.split("T")[0]}</td>
								</tr>
							);
						})}
					</tbody>
				</table>
				<StatusIndicator error={error} loading={loading} />
			</section>
		</main>
	);
};

export default Leads;
