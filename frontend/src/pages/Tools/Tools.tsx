import { useEffect, useState } from "react";
import ToolsIcon from "../../icons/ToolsIcon";
import StatusIndicator from "../../components/StatusIndicator/StatusIndicator";
import PlusIconSmall from "../../icons/PlusIconSmall";
import api from "../../axios";
import Footer from "../../components/layout/Footer/Footer";
import classNames from "classnames";
import type { Tool } from "../../interfaces";
// import type { Building } from "../../interfaces";
import "./Tools.scss";

// const emptyObject = () => ({
// 	id: crypto.randomUUID(),
// 	name: "",
// 	building: "",
// 	desc: "",
// });

const Tools = ({ buildings }) => {
	const [error, setError] = useState(null);
	const [loading, setLoading] = useState(false);
	const [tools, setTools] = useState<Tool[]>([]);
	const [toolsFilter, setToolsFilter] = useState("");
	const [editingTool, setEditingTool] = useState<Tool | null>(null);

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

	// const filteredTools = tools.filter((tool) => {
	// 	// If the filter is empty, show everything
	// 	if (!toolsFilter) return true;

	// 	// Perform a case-insensitive search
	// 	return tool.name?.toLowerCase().includes(toolsFilter.toLowerCase());
	// });

	// const sortedTools = tools.sort((tool)=> )

	// const handleTools = (id: string, name: string, value: string) => {
	// 	setTools((prev) =>
	// 		prev.map((tool) => (tool.id === id ? { ...tool, [name]: value } : tool)),
	// 	);
	// 	setToolsFilter("");
	// };

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
				// setTools(
				// 	updated.length > 0
				// 		? updated
				// 		: [emptyObject(), emptyObject(), emptyObject()],
				// );
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

	// const addEmptyObject = () => {
	// 	setTools((prev) => [...prev, emptyObject()]);
	// };

	const [filter, setFilter] = useState("");

	const filteredTools =
		filter === "" ? tools : tools.filter((p) => p.building === filter);

	const [selectActive, setSelectActive] = useState(false);

	const [formVisible, setFormVisible] = useState(false);

	const removeTool = async (id) => {
		setLoading(true);
		setError(null);
		try {
			await api.delete(`/tools/${id}`);
			setTools((prev) => prev.filter((p) => p._id !== id));
		} catch (error) {
			setError(error.response?.data.message);
		} finally {
			setLoading(false);
		}
	};

	return (
		<>
			<form
				onSubmit={handleSubmit}
				className={classNames("tools-form", {
					"tools-form--visible": formVisible,
				})}
			>
				<div>
					<label htmlFor="">Nazev</label>
					<input
						style={{ width: "100%" }}
						className={classNames("input", {
							"input--disabled": loading,
						})}
						type="text"
						onChange={(e) => handleToolForm(e.target.name, e.target.value)}
						value={toolForm.name}
						name="name"
						disabled={loading}
					/>
				</div>
				<div>
					<label htmlFor="">Pocet kusu</label>
					<input
						onChange={(e) => handleToolForm(e.target.name, e.target.value)}
						value={toolForm.qty}
						className={classNames("input", {
							"input--disabled": loading,
						})}
						type="number"
						min={1}
						name="qty"
					/>
				</div>
				<div>
					<label htmlFor="Stav">Stav</label>
					<input
						onChange={(e) => handleToolForm(e.target.name, e.target.value)}
						value={toolForm.status}
						className={classNames("input", {
							"input--disabled": loading,
						})}
						type="text"
						name="status"
					/>
				</div>
				<div>
					<label htmlFor="">Lokalita</label>
					<select
						className="input"
						onChange={(e) => handleToolForm(e.target.name, e.target.value)}
						value={toolForm.building}
						name="building"
						id=""
					>
						<option value="storage">Storage</option>
						<option value="service">Service</option>
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
					<label htmlFor="">Poznamka</label>
					<input
						onChange={(e) => handleToolForm(e.target.name, e.target.value)}
						value={toolForm.desc}
						className={classNames("input", {
							"input--disabled": loading,
						})}
						type="text"
						name="desc"
					/>
				</div>
				<div style={{ display: "flex" }}>
					<button
						style={{ background: "#000" }}
						className="btn"
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
						}}
					>
						Zrusit
					</button>
					<button className="btn" type="submit">
						Submit
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
						{/* <div>
						<select onChange={(e)=> se} className="input" name="" id="">
							<option value="">Sort</option>
							<option value="">A - Z</option>
							<option value="">Z - A</option>
						</select>
					</div> */}
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
								onClick={() => setFilter("storage")}
								className={classNames("tools__filter-btn", {
									"tools__filter-btn--active": filter === "storage",
								})}
							>
								Storage
							</button>
							<button
								onClick={() => setFilter("service")}
								className={classNames("tools__filter-btn", {
									"tools__filter-btn--active": filter === "service",
								})}
							>
								Service
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
										<td>
											<button
												onClick={() => {
													setFormVisible(true);
													setEditingTool(tool);
													setToolForm(tool);
												}}
											>
												Update
											</button>
										</td>
										<td>
											<button onClick={() => removeTool(tool._id)}>X</button>
										</td>
									</tr>
								);
							})}
						</tbody>
					</table>
					<button
						onClick={() => setFormVisible(true)}
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
