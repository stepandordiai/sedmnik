import { useEffect, useState } from "react";
import PersonIcon from "../../icons/PersonIcon";
import axios from "axios";
import StatusIndicator from "../../components/StatusIndicator/StatusIndicator";
import classNames from "classnames";
import XIcon from "../../icons/XIcon";
import "./Leads.scss";
import Footer from "../../components/layout/Footer/Footer";

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
	const [modalOpen, setModalOpen] = useState(false);
	const [selectedId, setSelectedId] = useState<string | null>(null);

	useEffect(() => {
		const getLeads = async () => {
			setLoading(true);
			setError(null);

			try {
				const res = await axios.get(
					`${import.meta.env.VITE_API_URL}/leads/all`,
				);

				const updated = res.data.map((lead) => ({
					id: lead._id,
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

	const handleLeadsInput = (id, name, value) => {
		setLeads((prev) =>
			prev.map((lead) => (lead.id === id ? { ...lead, [name]: value } : lead)),
		);
	};

	const saveLeads = async (data) => {
		const hasInvalidLead = data.some((lead) => {
			const hasOtherData =
				(lead.name && lead.name.trim() !== "") ||
				(lead.address && lead.address.trim() !== "") ||
				(lead.position && lead.position.trim() !== "") ||
				(lead.details && lead.details.trim() !== "");

			return (
				hasOtherData &&
				(!lead.tel || lead.tel.trim() === "" || lead.tel.length < 9)
			);
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
				data,
			);

			const updated = res.data.map((lead) => ({
				id: lead._id,
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

	const removeLead = () => {
		if (selectedId) {
			const updated = leads.filter((lead) => lead.id !== selectedId);
			setLeads(updated);
			saveLeads(updated);
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
					onClick={removeLead}
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
								<th></th>
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
													handleLeadsInput(
														lead.id,
														e.target.name,
														e.target.value,
													)
												}
												value={lead.name}
												className={classNames("input", {
													"input--disabled": loading,
												})}
												name="name"
												type="text"
												onBlur={() => saveLeads(leads)}
												disabled={loading}
											/>
										</td>
										<td>
											<input
												onChange={(e) =>
													handleLeadsInput(
														lead.id,
														e.target.name,
														e.target.value,
													)
												}
												name="tel"
												value={lead.tel}
												className={classNames("input", {
													"input--disabled": loading,
												})}
												type="text"
												onBlur={() => saveLeads(leads)}
												required
												disabled={loading}
											/>
										</td>
										<td>
											<input
												onChange={(e) =>
													handleLeadsInput(
														lead.id,
														e.target.name,
														e.target.value,
													)
												}
												name="address"
												value={lead.address}
												className={classNames("input", {
													"input--disabled": loading,
												})}
												type="text"
												onBlur={() => saveLeads(leads)}
											/>
										</td>
										<td>
											<input
												onChange={(e) =>
													handleLeadsInput(
														lead.id,
														e.target.name,
														e.target.value,
													)
												}
												name="position"
												value={lead.position}
												className={classNames("input", {
													"input--disabled": loading,
												})}
												type="text"
												onBlur={() => saveLeads(leads)}
											/>
										</td>
										<td>
											<input
												onChange={(e) =>
													handleLeadsInput(
														lead.id,
														e.target.name,
														e.target.value,
													)
												}
												name="details"
												value={lead.details}
												className={classNames("input", {
													"input--disabled": loading,
												})}
												type="text"
												onBlur={() => saveLeads(leads)}
											/>
										</td>
										<td>{lead.createdAt.split("T")[0]}</td>
										<td>
											<button
												onClick={() => {
													setSelectedId(lead.id);
													setModalOpen(true);
												}}
												className="plan__remove-btn"
											>
												<XIcon />
											</button>
										</td>
									</tr>
								);
							})}
						</tbody>
					</table>
					<StatusIndicator error={error} loading={loading} />
				</section>
				<Footer />
			</main>
		</>
	);
};

export default Leads;
