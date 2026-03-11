import { useEffect, useState } from "react";
import ToolsIcon from "../../icons/ToolsIcon";
import StatusIndicator from "../../components/StatusIndicator/StatusIndicator";
import PlusIconSmall from "../../icons/PlusIconSmall";
import api from "../../axios";
import Footer from "../../components/layout/Footer/Footer";
import classNames from "classnames";
import type { Tool } from "../../interfaces";
import XIcon from "../../icons/XIcon";
import PencilIcon from "../../icons/PencilIcon";
import "./Tools.scss";

const Tools = ({ buildings }) => {
	const [error, setError] = useState(null);
	const [loading, setLoading] = useState(false);
	const [tools, setTools] = useState<Tool[]>([]);
	const [toolsFilter, setToolsFilter] = useState("");
	const [editingTool, setEditingTool] = useState<Tool | null>(null);
	const [modalOpen, setModalOpen] = useState(false);
	const [selectedId, setSelectedId] = useState<string | null>(null);
	const [toolForm, setToolForm] = useState({
		name: "",
		qty: 1,
		status: "",
		building: "",
		desc: "",
	});

	const handleToolForm = (name, value) => {
		setToolForm((prev) => ({ ...prev, [name]: value }));
	};

	const createTool = async () => {
		setLoading(true);
		setError(null);

		try {
			await api.post("/tools", toolForm);

			setToolForm({
				name: "",
				qty: 1,
				status: "",
				building: "",
				desc: "",
			});
			setFormVisible(false);
		} catch (error) {
			setError(error.response?.data.message);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		const fetchToolsData = async () => {
			try {
				const res = await api.get("/tools/all");

				const updated = (res.data || []).map((tool: Tool) => ({
					_id: tool._id,
					name: tool.name,
					building: tool.building,
					qty: tool.qty,
					status: tool.status,
					desc: tool.desc,
				}));

				setTools(updated);
			} catch (error) {
				setError(error.response?.data?.message);
			}
		};

		fetchToolsData();
	}, [createTool]);

	const updateTool = async (id) => {
		setLoading(true);
		setError(null);

		try {
			await api.put(`/tools/${id}`, toolForm);
			setToolForm({
				name: "",
				qty: 1,
				status: "",
				building: "",
				desc: "",
			});
			setFormVisible(false);
		} catch (err) {
			setError(err.response?.data.message);
		} finally {
			setLoading(false);
		}
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		if (editingTool) {
			updateTool(editingTool._id);
		} else {
			createTool();
		}
	};

	const [filter, setFilter] = useState("");

	// TODO: learn this
	const filteredTools = tools.filter((t) => {
		const matchesBuilding = filter === "" || t.building === filter;
		const matchesName = toolsFilter === "" || t.name === toolsFilter;
		return matchesBuilding && matchesName;
	});

	const [selectActive, setSelectActive] = useState(false);

	const [formVisible, setFormVisible] = useState(false);

	const removeTool = async () => {
		setError(null);

		if (!selectedId) {
			return;
		}

		setLoading(true);

		try {
			await api.delete(`/tools/${selectedId}`);
			setTools((prev) => prev.filter((p) => p._id !== selectedId));

			setSelectedId(null);
			setModalOpen(false);
		} catch (error) {
			setError(error.response?.data.message);
		} finally {
			setLoading(false);
		}
	};

	return (
		<>
			{/* Banner */}
			<div
				className={classNames("header-modal", {
					"header-modal--visible": modalOpen,
				})}
			>
				<p style={{ fontWeight: 600 }}>Opravdu chcete tuto položku smazat?</p>
				<button
					onClick={removeTool}
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
			{/* Curtain */}
			<div
				onClick={() => {
					setSelectedId(null);
					setModalOpen(false);
				}}
				className={classNames("header__curtain", {
					"header__curtain--visible": modalOpen,
				})}
			></div>
			{/* Form */}
			<form
				onSubmit={handleSubmit}
				className={classNames("tools-form", {
					"tools-form--visible": formVisible,
				})}
			>
				<p style={{ fontWeight: 600 }}>Přidat nářadí</p>
				<div>
					<label htmlFor="name">
						Název nářadí <span style={{ color: "#f00" }}>*</span>
					</label>
					<input
						style={{ width: "100%" }}
						className={classNames("input", {
							"input--disabled": loading,
						})}
						type="text"
						onChange={(e) => handleToolForm(e.target.name, e.target.value)}
						value={toolForm.name}
						name="name"
						id="name"
						disabled={loading}
					/>
				</div>
				<div style={{ display: "flex", gap: 5 }}>
					<div style={{ flexGrow: 1 }}>
						<label htmlFor="qty">Počet kusů</label>
						<input
							onChange={(e) => handleToolForm(e.target.name, e.target.value)}
							value={toolForm.qty}
							className={classNames("input", {
								"input--disabled": loading,
							})}
							type="number"
							min={1}
							name="qty"
							id="qty"
						/>
					</div>
					<div style={{ flexGrow: 1 }}>
						<label htmlFor="status">Stav</label>
						<input
							onChange={(e) => handleToolForm(e.target.name, e.target.value)}
							value={toolForm.status}
							className={classNames("input", {
								"input--disabled": loading,
							})}
							type="text"
							name="status"
							id="status"
						/>
					</div>
				</div>
				<div style={{ display: "flex", flexDirection: "column" }}>
					<label htmlFor="place">Lokalita</label>
					<select
						className="input"
						onChange={(e) => handleToolForm(e.target.name, e.target.value)}
						value={toolForm.building}
						name="building"
						id="place"
					>
						<option value="Sklad">Sklad</option>
						<option value="Servis">Servis</option>
						{buildings.map((b, i) => {
							return (
								<option key={i} value={b.name}>
									{b.name}
								</option>
							);
						})}
					</select>
				</div>
				<div>
					<label htmlFor="desc">Poznámka</label>
					<input
						onChange={(e) => handleToolForm(e.target.name, e.target.value)}
						value={toolForm.desc}
						className={classNames("input", {
							"input--disabled": loading,
						})}
						type="text"
						name="desc"
						id="desc"
					/>
				</div>
				<div style={{ display: "flex", gap: 5 }}>
					<button
						style={{ background: "#000" }}
						className="tools-form__btn"
						onClick={(e) => {
							e.preventDefault();
							setFormVisible(false);
							setToolForm({
								name: "",
								qty: 1,
								status: "",
								building: "",
								desc: "",
							});
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
				className={classNames("tools-curtain", {
					"tools-curtain--visible": formVisible,
				})}
			></div>
			<main className="main">
				<section className="section">
					<div className="container-title">
						<ToolsIcon size={20} />
						<h2>Nářadí</h2>
					</div>
					<div>
						<div style={{ display: "flex", gap: 5 }}>
							<button
								onClick={() => setFilter("")}
								className={classNames("tools__filter-btn", {
									"tools__filter-btn--active": filter === "",
								})}
							>
								All
							</button>
							<button
								onClick={() => setFilter("Sklad")}
								className={classNames("tools__filter-btn", {
									"tools__filter-btn--active": filter === "Sklad",
								})}
							>
								Sklad
							</button>
							<button
								onClick={() => setFilter("Servis")}
								className={classNames("tools__filter-btn", {
									"tools__filter-btn--active": filter === "Servis",
								})}
							>
								Servis
							</button>
							<div className="select">
								<button
									onClick={() => setSelectActive((prev) => !prev)}
									className={classNames("tools__filter-btn", {
										"tools__filter-btn--active": buildings.some(
											(b) => b.name.includes(filter) && filter !== "",
										),
									})}
								>
									AKCE
								</button>
								<div
									className={classNames("select-container", {
										"select-container--active": selectActive,
									})}
								>
									{buildings.map((b, i) => {
										return (
											<button
												key={i}
												onClick={() => {
													setFilter(b.name);
													setSelectActive(false);
												}}
												className={classNames("select-container__btn", {
													"select-container__btn--active": b.name === filter,
												})}
											>
												{b.name}
											</button>
										);
									})}
								</div>
							</div>
						</div>
						<div
							style={{
								display: "flex",
								flexDirection: "column",
								alignItems: "flex-end",
							}}
						>
							<label htmlFor="dasddc">Filter</label>
							<input
								style={{ width: "min-content" }}
								onChange={(e) => setToolsFilter(e.target.value)}
								value={toolsFilter}
								className="input"
								type="text"
								id="dasddc"
							/>
						</div>
					</div>
					<table className="tools-table">
						<thead>
							<tr>
								<th>Nazev</th>
								<th>Stavba</th>
								<th>Kusy</th>
								<th>Stav</th>
								<th>Poznamky</th>
								<th></th>
								<th></th>
							</tr>
						</thead>
						<tbody>
							{filteredTools.map((tool) => {
								return (
									<tr key={tool._id}>
										<td>{tool.name}</td>
										<td>{tool.building}</td>
										<td>
											<span>{tool.qty}</span>
										</td>
										<td>
											<span>{tool.status}</span>
										</td>
										<td>
											<span>{tool.desc}</span>
										</td>
										<td style={{ width: "1%", paddingRight: 10 }}>
											<button
												className="tools__edit-btn"
												onClick={() => {
													setFormVisible(true);
													setEditingTool(tool);
													setToolForm(tool);
												}}
											>
												<PencilIcon />
											</button>
										</td>
										<td style={{ width: "1%" }}>
											<button
												className="tools__remove-btn"
												onClick={() => {
													setSelectedId(tool._id);
													setModalOpen(true);
												}}
											>
												<XIcon />
											</button>
										</td>
									</tr>
								);
							})}
						</tbody>
					</table>
					<button
						onClick={() => {
							setEditingTool(null);
							setToolForm({
								name: "",
								qty: 1,
								status: "",
								building: "",
								desc: "",
							});
							setFormVisible(true);
						}}
						className="responsibilities__btn"
					>
						<PlusIconSmall />
						<span>Přidat</span>
					</button>
					<StatusIndicator error={error} loading={loading} />
				</section>
				<Footer />
			</main>
		</>
	);
};

export default Tools;
