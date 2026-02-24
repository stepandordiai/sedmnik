import { useEffect, useState } from "react";
import ToolsIcon from "../../icons/ToolsIcon";
import StatusIndicator from "../../components/StatusIndicator/StatusIndicator";
import PlusIconSmall from "../../icons/PlusIconSmall";
import api from "../../axios";
import Footer from "../../components/layout/Footer/Footer";
import classNames from "classnames";
import "./Tools.scss";

interface Tool {
	id: string;
	name: string;
	building: string;
	desc: string;
}

const emptyObject = () => ({
	id: crypto.randomUUID(),
	name: "",
	building: "",
	desc: "",
});

const Tools = ({ buildings }) => {
	const [error, setError] = useState(null);
	const [loading, setLoading] = useState(false);
	const [tools, setTools] = useState<Tool[]>([emptyObject(), emptyObject()]);
	const [toolsFilter, setToolsFilter] = useState("");

	const filteredTools = tools.filter((tool) => {
		// If the filter is empty, show everything
		if (!toolsFilter) return true;

		// Perform a case-insensitive search
		return tool.name?.toLowerCase().includes(toolsFilter.toLowerCase());
	});

	// const sortedTools = tools.sort((tool)=> )

	const handleTools = (id: string, name: string, value: string) => {
		setTools((prev) =>
			prev.map((tool) => (tool.id === id ? { ...tool, [name]: value } : tool)),
		);
		setToolsFilter("");
	};

	useEffect(() => {
		const fetchToolsData = async () => {
			try {
				const res = await api.get("/tools/all");

				const updated = (res.data || []).map((tool: Tool) => ({
					id: crypto.randomUUID(),
					name: tool.name,
					building: tool.building,
					desc: tool.desc,
				}));

				setTools(
					updated.length > 0
						? updated
						: [emptyObject(), emptyObject(), emptyObject()],
				);
			} catch (error) {}
		};

		fetchToolsData();
	}, []);

	const saveTools = async () => {
		setLoading(true);
		setError(null);

		try {
			await api.put("/tools", tools, {});
		} catch (err) {
			setError(err.response?.data.message);
		} finally {
			setLoading(false);
		}
	};

	const addEmptyObject = () => {
		setTools((prev) => [...prev, emptyObject()]);
	};

	return (
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
					<div
						style={{
							display: "flex",
							flexDirection: "column",
							alignItems: "flex-end",
						}}
					>
						<label htmlFor="dasddc">Filter</label>
						<input
							onChange={(e) => setToolsFilter(e.target.value)}
							value={toolsFilter}
							className="input"
							type="text"
							id="dasddc"
						/>
					</div>
				</div>

				<table>
					<thead>
						<tr>
							<th>Nazev</th>
							<th>Stavba</th>
							<th>Poznamky</th>
						</tr>
					</thead>
					<tbody>
						{filteredTools.map((tool) => {
							return (
								<tr key={tool.id}>
									<td>
										<input
											style={{ width: "100%" }}
											className={classNames("input", {
												"input--disabled": loading,
											})}
											type="text"
											onChange={(e) =>
												handleTools(tool.id, e.target.name, e.target.value)
											}
											value={tool.name}
											name="name"
											placeholder="Nazev"
											onBlur={saveTools}
											disabled={loading}
										/>
									</td>
									<td>
										<select
											className={classNames("input", {
												"select--disabled": loading,
											})}
											onChange={(e) =>
												handleTools(tool.id, e.target.name, e.target.value)
											}
											onBlur={saveTools}
											name="building"
											value={tool.building}
											disabled={loading}
										>
											<option value="">Ne nazvano</option>
											{buildings.map((building, i) => {
												return (
													<option key={i} value={building.name}>
														{building.name}
													</option>
												);
											})}
										</select>
									</td>
									<td>
										<input
											onChange={(e) =>
												handleTools(tool.id, e.target.name, e.target.value)
											}
											value={tool.desc}
											name="desc"
											className={classNames("input", {
												"input--disabled": loading,
											})}
											type="text"
											placeholder="Poznamky"
											onBlur={saveTools}
											disabled={loading}
										/>
									</td>
								</tr>
							);
						})}
					</tbody>
				</table>
				<button onClick={addEmptyObject} className="responsibilities__btn">
					<PlusIconSmall />
					<span>Přidat</span>
				</button>
				<StatusIndicator error={error} loading={loading} />
			</section>
			<Footer />
		</main>
	);
};

export default Tools;
