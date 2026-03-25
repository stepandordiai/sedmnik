import { useEffect, useRef, useState } from "react";
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

const initTool = {
	img: "",
	code: "",
	name: "",
	qty: 1,
	storageQty: 1,
	status: "",
	building: [
		{
			name: "",
			qty: 0,
		},
	],
	desc: "",
};

const Tools = ({ buildings }) => {
	const [error, setError] = useState(null);
	const [loading, setLoading] = useState(false);
	const [tools, setTools] = useState<Tool[]>([]);
	const [toolsFilter, setToolsFilter] = useState("");
	const [editingTool, setEditingTool] = useState<Tool | null>(null);
	const [modalOpen, setModalOpen] = useState(false);
	const [selectedId, setSelectedId] = useState<string | null>(null);
	const [toolForm, setToolForm] = useState(initTool);

	const totalSpreadedQty = toolForm.building.reduce((acc, b) => {
		return acc + b.qty;
	}, 0);

	const remainingQty = toolForm.qty - totalSpreadedQty;

	const handleToolForm = (name, value, index?: number) => {
		if (name === "building" && index !== undefined) {
			setToolForm((prev) => {
				const updated = [...prev.building];
				updated[index] = { ...updated[index], name: value };
				return { ...prev, building: updated };
			});
		} else if (name === "buildingQty" && index !== undefined) {
			setToolForm((prev) => {
				const updated = [...prev.building];
				const current = updated[index].qty;
				const next = current + Number(value);

				updated[index] = {
					...updated[index],
					qty: Math.max(0, Math.min(next, remainingQty + current)),
				};
				return { ...prev, building: updated };
			});
		} else if (name === "qty") {
			setToolForm((prev) => ({
				...prev,
				qty: Number(value),
				building: prev.building.map((b) => ({ ...b, qty: 0 })), // ← reset all
			}));
		} else {
			setToolForm((prev) => ({ ...prev, [name]: value }));
		}
	};

	const removeBuilding = (index: number) => {
		setToolForm((prev) => ({
			...prev,
			building: prev.building.filter((_, i) => i !== index),
		}));
	};

	const createTool = async () => {
		setLoading(true);
		setError(null);

		try {
			const res = await api.post("/tools", {
				...toolForm,
				storageQty: toolForm.qty - totalSpreadedQty,
			});

			setTools((prev) => [...prev, res.data]);

			setToolForm(initTool);
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

				setTools(res.data || []);
			} catch (error) {
				setError(error.response?.data?.message);
			}
		};

		fetchToolsData();
	}, []);

	const updateTool = async (id) => {
		setLoading(true);
		setError(null);

		try {
			const res = await api.put(`/tools/${id}`, {
				...toolForm,
				storageQty: toolForm.qty - totalSpreadedQty,
			});

			// setTools((prev) => [...prev, res.data]);
			setTools((prev) =>
				prev.map((tool) => (tool._id === id ? res.data : tool)),
			);

			setToolForm(initTool);
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
		const buildingNames = t.building.map((b) => b.name);
		const matchesBuilding =
			filter === "" ||
			buildingNames.includes(filter) ||
			(filter === "Sklad" && t.storageQty > 0) || // only if these are actual fields on the tool
			filter === "Servis";
		const matchesName = toolsFilter === "" || t.name.includes(toolsFilter);
		return matchesBuilding && matchesName;
	});

	const [selectActive, setSelectActive] = useState(false);
	const [formVisible, setFormVisible] = useState(false);

	const selectContainerRef = useRef<HTMLDivElement>(null);

	const handleSelect = () => {
		setSelectActive((prev) => !prev);
	};

	useEffect(() => {
		const handleClickOutside = (e: MouseEvent) => {
			if (
				selectContainerRef.current &&
				!selectContainerRef.current.contains(e.target as Node)
			) {
				setSelectActive(false);
			}
		};

		document.addEventListener("click", handleClickOutside);
		return () => document.removeEventListener("click", handleClickOutside);
	}, []);

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

	const addBuilding = () => {
		setToolForm((prev) => ({
			...prev,
			building: [...prev.building, { name: "", qty: 0 }],
		}));
	};

	return (
		<>
			{/* Banner */}
			<div
				className={classNames("tools-modal", {
					"tools-modal--visible": modalOpen,
				})}
			>
				<p style={{ fontWeight: 600, padding: 10 }}>
					Opravdu chcete tuto položku smazat?
				</p>
				<div className="tools-modal-btn-container">
					<button onClick={removeTool} className="tools-modal__btn">
						Smazat
					</button>
					<button
						className="tools-modal__btn"
						onClick={() => {
							setSelectedId(null);
							setModalOpen(false);
						}}
					>
						Zrušit
					</button>
				</div>
			</div>
			{/* Form */}
			<form
				onSubmit={handleSubmit}
				className={classNames("tools-form", {
					"tools-form--visible": formVisible,
				})}
			>
				<p style={{ fontWeight: 600 }}>Přidat nářadí</p>
				<div>
					<label htmlFor="foto">Foto</label>
					<input
						style={{ width: "100%" }}
						className={classNames("input", {
							"input--disabled": loading,
						})}
						type="text"
						onChange={(e) => handleToolForm(e.target.name, e.target.value)}
						value={toolForm.img}
						name="img"
						id="foto"
						disabled={loading}
					/>
				</div>
				<div>
					<label htmlFor="code">Kód</label>
					<input
						style={{ width: "100%" }}
						className={classNames("input", {
							"input--disabled": loading,
						})}
						type="text"
						onChange={(e) => handleToolForm(e.target.name, e.target.value)}
						value={toolForm.code}
						name="code"
						id="code"
						disabled={loading}
					/>
				</div>
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
				{toolForm.building.map((buildingItem, index) => {
					const allBuildings = ["Servis", ...buildings.map((b) => b.name)];

					const selectedBuildings = toolForm.building
						.map((b) => b.name)
						.filter((_, i) => i !== index);

					return (
						<div key={index} style={{ display: "flex", gap: 5, width: "100%" }}>
							<div style={{ display: "flex", flexDirection: "column" }}>
								<label htmlFor="place">Lokalita</label>
								<select
									className="input"
									onChange={(e) =>
										handleToolForm(e.target.name, e.target.value, index)
									}
									value={buildingItem.name}
									name="building"
									id="place"
								>
									<option value="">-- Vyberte --</option>
									{allBuildings.map((b, i) => {
										return (
											<option
												key={i}
												value={b}
												disabled={selectedBuildings.includes(b)}
											>
												{b}
											</option>
										);
									})}
								</select>
							</div>
							<div
								style={{
									display: "flex",
									flexDirection: "column",
									width: "100%",
								}}
							>
								<span>Počet kusů</span>
								<div
									style={{
										display: "flex",
										gap: 5,
										width: "100%",
										height: "100%",
									}}
								>
									<button
										style={{
											aspectRatio: "1/1",
											display: "flex",
											justifyContent: "center",
											alignItems: "center",
										}}
										type="button"
										className="btn"
										onClick={() => handleToolForm("buildingQty", -1, index)}
										disabled={buildingItem.qty < 1}
									>
										-
									</button>
									<div
										style={{
											flexGrow: 1,
											background: "var(--bg-clr)",
											border: "var(--secondary-border)",
											borderRadius: 5,
											display: "flex",
											justifyContent: "center",
											alignItems: "center",
										}}
									>
										{buildingItem.qty}
									</div>
									<button
										style={{
											aspectRatio: "1/1",
											display: "flex",
											justifyContent: "center",
											alignItems: "center",
										}}
										type="button"
										className="btn"
										onClick={() => handleToolForm("buildingQty", +1, index)}
										disabled={remainingQty <= 0}
									>
										+
									</button>
									<button
										style={{
											aspectRatio: "1/1",
											display: "flex",
											justifyContent: "center",
											alignItems: "center",
										}}
										className="btn--delete"
										onClick={() => removeBuilding(index)}
									>
										<XIcon />
									</button>
								</div>
							</div>
						</div>
					);
				})}
				<button type="button" onClick={addBuilding} className="btn">
					Přidat lokalitu
				</button>
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
							setToolForm(initTool);
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
			{/* Curtain */}
			<div
				onClick={() => {
					setSelectedId(null);
					setModalOpen(false);
					setFormVisible(false);
				}}
				className={classNames("tools-curtain", {
					"tools-curtain--visible": formVisible || modalOpen,
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
								Vše ({tools.length})
							</button>
							<button
								onClick={() => setFilter("Sklad")}
								className={classNames("tools__filter-btn", {
									"tools__filter-btn--active": filter === "Sklad",
								})}
							>
								Sklad ({tools.filter((tool) => tool.storageQty > 0).length})
							</button>
							<button
								onClick={() => setFilter("Servis")}
								className={classNames("tools__filter-btn", {
									"tools__filter-btn--active": filter === "Servis",
								})}
							>
								Servis (
								{
									tools.filter((tool) =>
										tool.building.find((t) => t.name === "Servis"),
									).length
								}
								)
							</button>
							<div ref={selectContainerRef} className="select">
								<div>
									<button
										onClick={handleSelect}
										className={classNames("tools__filter-btn", {
											"tools__filter-btn--active": buildings.some(
												(b) => b.name.includes(filter) && filter !== "",
											),
										})}
									>
										Akce
									</button>
									{filter !== "" &&
										filter !== "Sklad" &&
										filter !== "Servis" && (
											<span className="tools__filter-btn-extra">
												{/* TODO: learn this */}
												{buildings.find((b) => b.name === filter)?.name ??
													filter}{" "}
												({filter !== "" ? filteredTools.length : ""})
											</span>
										)}
								</div>
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
					<button
						onClick={() => {
							setEditingTool(null);
							setToolForm(toolForm);
							setFormVisible(true);
						}}
						className="responsibilities__btn"
					>
						<PlusIconSmall />
						<span>Přidat</span>
					</button>
					<table className="tools-table">
						<thead>
							<tr>
								<th
									style={{
										width: "1%",
										whiteSpace: "nowrap",
										paddingRight: 20,
									}}
								>
									Foto
								</th>
								<th
									style={{
										width: "1%",
										whiteSpace: "nowrap",
										paddingRight: 20,
									}}
								>
									Kód
								</th>
								<th
									style={{
										width: "1%",
										whiteSpace: "nowrap",
										paddingRight: 20,
									}}
								>
									Název
								</th>
								{filter !== "" && filter !== "Sklad" && (
									<th
										style={{
											width: "1%",
											whiteSpace: "nowrap",
											paddingRight: 20,
										}}
									>
										Lokalita
									</th>
								)}
								<th
									style={{
										width: "1%",
										whiteSpace: "nowrap",
										paddingRight: 20,
									}}
								>
									Kusy
								</th>
								<th
									style={{
										width: "1%",
										whiteSpace: "nowrap",
										paddingRight: 20,
									}}
								>
									Stav
								</th>
								<th
									style={{
										whiteSpace: "nowrap",
										paddingRight: 20,
									}}
								>
									Poznámky
								</th>
								<th></th>
								<th></th>
							</tr>
						</thead>
						<tbody>
							{filteredTools.map((tool) => {
								return (
									<tr key={tool._id}>
										<td
											style={{
												width: "1%",
												whiteSpace: "nowrap",
												paddingRight: 20,
											}}
										>
											{tool.img && <img src={tool.img} alt="" />}
										</td>
										<td
											style={{
												width: "1%",
												whiteSpace: "nowrap",
												paddingRight: 20,
											}}
										>
											<span>{tool.code}</span>
										</td>
										<td
											style={{
												width: "1%",
												whiteSpace: "nowrap",
												paddingRight: 20,
											}}
										>
											{tool.name}
										</td>
										{tool.building.find((b) => b.name === filter)?.name && (
											<td
												style={{
													width: "1%",
													whiteSpace: "nowrap",
													paddingRight: 20,
												}}
											>
												{filter}
											</td>
										)}
										<td
											style={{
												width: "1%",
												whiteSpace: "nowrap",
												paddingRight: 20,
											}}
										>
											<span>
												{filter === "Sklad"
													? tool.storageQty
													: filter !== ""
														? (tool.building.find((b) => b.name === filter)
																?.qty ?? 0)
														: tool.qty}
											</span>
										</td>
										<td
											style={{
												width: "1%",
												whiteSpace: "nowrap",
												paddingRight: 20,
											}}
										>
											<span>{tool.status}</span>
										</td>
										<td
											style={{
												whiteSpace: "nowrap",
												paddingRight: 20,
											}}
										>
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
					{filteredTools.length < 1 && (
						<p
							style={{
								textAlign: "center",
								fontSize: "24px",
								fontWeight: 500,
								padding: "50px 0",
							}}
						>
							Žádná data
						</p>
					)}

					<StatusIndicator error={error} loading={loading} />
				</section>
				<Footer />
			</main>
		</>
	);
};

export default Tools;
