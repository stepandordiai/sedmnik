import { useEffect, useState } from "react";
import axios from "axios";
import classNames from "classnames";
import StatusIndicator from "../../components/StatusIndicator/StatusIndicator";
import Footer from "../../components/layout/Footer/Footer";
import PersonIcon from "../../icons/PersonIcon";
import XIcon from "../../icons/XIcon";
import PlusIconSmall from "../../icons/PlusIconSmall";
import PencilIcon from "../../icons/PencilIcon";
import "./Leads.scss";
import FilterIcon from "../../icons/FilterIcon";

interface Lead {
	_id?: string;
	name: string;
	tel: string;
	address: string;
	position: string;
	details: string;
}

// TODO: learn this
const initLead: Omit<Lead, "_id"> = {
	name: "",
	tel: "",
	address: "",
	position: "",
	details: "",
};

const Leads = () => {
	const [leads, setLeads] = useState([]);
	const [error, setError] = useState(null);
	const [loading, setLoading] = useState(false);
	const [modalOpen, setModalOpen] = useState(false);
	const [selectedId, setSelectedId] = useState<string | null>(null);
	const [formVisible, setFormVisible] = useState(false);
	const [leadForm, setLeadForm] = useState<Lead>(initLead);
	const [editingLead, setEditingLead] = useState<Lead | null>(null);

	const handleLeadForm = (name, value) => {
		setLeadForm((prev) => ({ ...prev, [name]: value }));
	};

	const createLead = async () => {
		setError(null);
		setLoading(true);

		try {
			const res = await axios.post(
				`${import.meta.env.VITE_API_URL}/leads`,
				leadForm,
			);

			// TODO: learn this
			setLeads((prev) => [...prev, res.data]);

			setFormVisible(false);
			setLeadForm(initLead);
		} catch (err) {
			setError(err.response?.data.message);
		} finally {
			setLoading(false);
		}
	};

	const updateLead = async (id) => {
		setError(null);
		setLoading(true);

		try {
			const res = await axios.put(
				`${import.meta.env.VITE_API_URL}/leads/${id}`,
				leadForm,
			);

			// TODO: learn this
			setLeads((prev) =>
				prev.map((lead) => (lead.id === id ? res.data : lead)),
			);

			setLeadForm(initLead);
			setFormVisible(false);
		} catch (err) {
			setError(err.response?.data.message);
		} finally {
			setLoading(false);
		}
	};

	const deleteLead = async () => {
		setError(null);
		setLoading(true);

		try {
			await axios.delete(`${import.meta.env.VITE_API_URL}/leads/${selectedId}`);

			setLeads((prev) => prev.filter((lead) => lead._id !== selectedId));

			setModalOpen(false);
			setSelectedId(null);
		} catch (err) {
			setError(err.response?.data.message);
		} finally {
			setLoading(false);
		}
	};

	const handleLead = (e) => {
		e.preventDefault();
		if (editingLead) {
			updateLead(editingLead._id);
		} else {
			createLead();
		}
	};

	useEffect(() => {
		const getLeads = async () => {
			setLoading(true);
			setError(null);

			try {
				const res = await axios.get(
					`${import.meta.env.VITE_API_URL}/leads/all`,
				);

				// const updated = res.data.map((lead) => ({
				// 	id: lead._id,
				// 	name: lead.name,
				// 	tel: lead.tel,
				// 	address: lead.address,
				// 	position: lead.position,
				// 	details: lead.details,
				// 	createdAt: lead.createdAt,
				// }));

				// const filled = [...updated];

				// while (filled.length < 1) {
				// 	filled.push(emptyLeadRow());
				// }

				setLeads(res.data);
			} catch (err) {
				setError(error.response?.data.message);
			} finally {
				setLoading(false);
			}
		};

		getLeads();
	}, []);

	// const handleLeadsInput = (id, name, value) => {
	// 	setLeads((prev) =>
	// 		prev.map((lead) => (lead.id === id ? { ...lead, [name]: value } : lead)),
	// 	);
	// };

	// const saveLeads = async (data) => {
	// 	const hasInvalidLead = data.some((lead) => {
	// 		const hasOtherData =
	// 			(lead.name && lead.name.trim() !== "") ||
	// 			(lead.address && lead.address.trim() !== "") ||
	// 			(lead.position && lead.position.trim() !== "") ||
	// 			(lead.details && lead.details.trim() !== "");

	// 		return (
	// 			hasOtherData &&
	// 			(!lead.tel || lead.tel.trim() === "" || lead.tel.length < 9)
	// 		);
	// 	});

	// 	if (hasInvalidLead) {
	// 		setError("Telefon je povinné pole");
	// 		return;
	// 	}

	// 	setError(null);
	// 	setLoading(true);

	// 	try {
	// 		const res = await axios.put(
	// 			`${import.meta.env.VITE_API_URL}/leads`,
	// 			data,
	// 		);

	// 		setLeads(res.data);
	// 	} catch (err) {
	// 		setError(err.response?.data.message);
	// 	} finally {
	// 		setLoading(false);
	// 	}
	// };

	// const removeLead = () => {
	// 	if (selectedId) {
	// 		const updated = leads.filter((lead) => lead.id !== selectedId);
	// 		setLeads(updated);
	// 		saveLeads(updated);
	// 	}
	// 	setSelectedId(null);
	// 	setModalOpen(false);
	// };

	const [copiedId, setCopiedId] = useState<string | null>(null);

	const handleCopy = (text: string, id: string) => {
		navigator.clipboard.writeText(text);
		setCopiedId(id);
		setTimeout(() => setCopiedId(null), 1500);
	};

	const uniquePositions = [
		...new Set(leads.map((lead) => lead.position).filter(Boolean)),
	];

	const [positionFilter, setPositionFilter] = useState("");
	const [dateFilter, setDateFilter] = useState("");

	// filtered leads derived from state
	// TODO: learn this
	const filteredLeads = leads
		.filter((lead) =>
			positionFilter ? lead.position === positionFilter : true,
		)
		.sort((a, b) => {
			if (dateFilter === "desc") return b.createdAt.localeCompare(a.createdAt);
			if (dateFilter === "asc") return a.createdAt.localeCompare(b.createdAt);
			return 0;
		});

	return (
		<>
			<form
				onSubmit={handleLead}
				className={classNames("leads-form", {
					"leads-form--active": formVisible,
				})}
			>
				<p style={{ fontSize: "24px" }}>
					{editingLead ? "Upravit lead" : "Přidat lead"}
				</p>
				<div>
					<label htmlFor="name">Jméno</label>
					<input
						onChange={(e) => handleLeadForm(e.target.name, e.target.value)}
						value={leadForm.name}
						className={classNames("input", {
							"input--disabled": loading,
						})}
						name="name"
						type="text"
						id="name"
						disabled={loading}
					/>
				</div>
				<div>
					<label htmlFor="tel">
						Telefonní číslo<span style={{ color: "#f00" }}>*</span>
					</label>
					<input
						onChange={(e) => handleLeadForm(e.target.name, e.target.value)}
						name="tel"
						value={leadForm.tel}
						className={classNames("input", {
							"input--disabled": loading,
						})}
						type="text"
						required
						disabled={loading}
					/>
				</div>
				<div>
					<label htmlFor="address">Adresa</label>
					<input
						onChange={(e) => handleLeadForm(e.target.name, e.target.value)}
						name="address"
						value={leadForm.address}
						className={classNames("input", {
							"input--disabled": loading,
						})}
						type="text"
					/>
				</div>
				<div>
					<label htmlFor="position">Pozice</label>
					<input
						onChange={(e) => handleLeadForm(e.target.name, e.target.value)}
						name="position"
						value={leadForm.position}
						className={classNames("input", {
							"input--disabled": loading,
						})}
						type="text"
					/>
				</div>
				<div>
					<label htmlFor="details">Poznámky</label>
					<input
						onChange={(e) => handleLeadForm(e.target.name, e.target.value)}
						name="details"
						value={leadForm.details}
						className={classNames("input", {
							"input--disabled": loading,
						})}
						type="text"
					/>
				</div>
				<div style={{ display: "flex", gap: 5 }}>
					<button
						style={{ background: "#000" }}
						className="tools-form__btn"
						onClick={(e) => {
							e.preventDefault();
							setFormVisible(false);
							setLeadForm(initLead);
							setError(null);
						}}
					>
						Zrušit
					</button>
					<button className="tools-form__btn" type="submit">
						Přidat
					</button>
				</div>
				<StatusIndicator error={error} loading={loading} />
			</form>
			<div
				className={classNames("header-modal", {
					"header-modal--visible": modalOpen,
				})}
			>
				<p style={{ fontSize: "24px" }}>Opravdu chcete tuto položku smazat?</p>
				<button
					onClick={deleteLead}
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
					"header__curtain--visible": formVisible || modalOpen,
				})}
			></div>
			<main className="main">
				<section className="section">
					<div className="container-title">
						<FilterIcon size={20} />
						<h2>Filtr</h2>
					</div>
					<div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
						<div>
							<label htmlFor="select-position">Pozice</label>
							<select
								className="input"
								id="select-position"
								onChange={(e) => setPositionFilter(e.target.value)}
								value={positionFilter}
							>
								<option value="">Nevybráno</option>
								{uniquePositions.map((position, i) => {
									return (
										<option key={i} value={position}>
											{position}
										</option>
									);
								})}
							</select>
						</div>
						<div>
							<label htmlFor="filter-date">Seřadit podle data</label>
							<select
								className="input"
								onChange={(e) => setDateFilter(e.target.value)}
								value={dateFilter}
								id="filter-date"
							>
								<option value="">Nevybráno</option>
								<option value="desc">Od nejnovějších</option>{" "}
								{/* newest first = desc */}
								<option value="asc">Od nejstarších</option>{" "}
								{/* oldest first = asc */}
							</select>
						</div>
					</div>
					<button
						className="btn--delete"
						onClick={() => {
							setDateFilter("");
							setPositionFilter("");
						}}
					>
						Zrušit filtry
					</button>
				</section>
				<section className="section">
					<div className="container-title">
						<PersonIcon size={20} />
						<h2>Potenciální pracovníci</h2>
					</div>
					<button
						onClick={() => {
							setEditingLead(null);
							setLeadForm(leadForm);
							setFormVisible(true);
						}}
						className="leads__btn"
					>
						<PlusIconSmall />
						<span>Přidat</span>
					</button>
					<table className="leads-table">
						<thead>
							<tr>
								<th>#</th>
								<th>Jméno</th>
								<th>
									Telefonní číslo<span style={{ color: "#f00" }}>*</span>
								</th>
								<th>Adresa</th>
								<th>Pozice</th>
								<th className="fixed-data">Poznámky</th>
								<th>Datum</th>
								<th></th>
								<th></th>
							</tr>
						</thead>
						<tbody>
							{filteredLeads.map((lead, i) => {
								return (
									<tr key={lead._id}>
										<td>{i + 1}</td>
										<td>{lead.name}</td>
										<td>
											<button
												className={`copy-btn ${copiedId ? "copy-btn--disable" : ""}`}
												onClick={() => handleCopy(lead.tel, lead._id)}
											>
												{copiedId === lead._id ? "Copied!" : lead.tel}
											</button>
										</td>
										<td>{lead.address}</td>
										<td>{lead.position}</td>
										<td className="fixed-data">{lead.details}</td>
										<td>{lead.createdAt.split("T")[0]}</td>
										<td>
											<button
												onClick={() => {
													setLeadForm(lead);
													setEditingLead(lead);
													setFormVisible(true);
												}}
												className="btn--update"
												title="Upravit lead"
											>
												<PencilIcon />
											</button>
										</td>
										<td>
											<button
												onClick={() => {
													setSelectedId(lead._id);
													setModalOpen(true);
												}}
												className="btn--delete"
												title="Smazat lead"
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
