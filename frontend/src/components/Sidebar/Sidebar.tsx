import { useAuth } from "../../context/AuthContext";
import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import classNames from "classnames";
import TeamIcon from "../../icons/TeamIcon";
import BuildingIcon from "../../icons/BuildingIcon";
import api from "../../axios";
import StatusIndicator from "../StatusIndicator/StatusIndicator";
import PlusIcon from "../../icons/PlusIcon";
import PlusIconSmall from "../../icons/PlusIconSmall";
import LoadingSpinner from "../LoadingSpinner/LoadingSpinner";
import "./Sidebar.scss";

const Sidebar = ({ allUsers, buildings, setBuildings }) => {
	const { user } = useAuth();

	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [modalFormVisible, setModalFormVisible] = useState(false);
	const [modalFormData, setModalFormData] = useState("");
	const [sidebarTeam, setSidebarTeam] = useState(true);
	const [sidebarBuildings, setSidebarBuildings] = useState(false);

	useEffect(() => {
		const fetchBuildingData = async () => {
			setLoading(true);
			setError(null);

			try {
				const res = await api.get(`/api/buildings/all`);

				setBuildings(res.data);
			} catch (err) {
				setError(err.response.data.message);
			} finally {
				setLoading(false);
			}
		};

		fetchBuildingData();
	}, []);

	const saveModalFormData = async () => {
		setLoading(true);
		setError(null);

		try {
			const res = await api.post(`/api/buildings`, { name: modalFormData });

			// Update state with saved data
			setBuildings((prev) => [...prev, res.data]);

			// Hide modal form
			setModalFormVisible(false);

			// Clear input value in modal form
			setModalFormData("");
		} catch (err) {
			// TODO: learn this
			setError(err.response.data.message);
		} finally {
			setLoading(false);
		}
	};

	// Only render sidebar if logged in and users exist
	if (!user || allUsers.length === 0) return null;

	return (
		<>
			<form
				onSubmit={(e) => {
					e.preventDefault();
					saveModalFormData();
				}}
				className={classNames("modal-form", {
					"modal-form--visible": modalFormVisible,
				})}
			>
				<div style={{ display: "flex", justifyContent: "space-between" }}>
					<h2 style={{ fontWeight: 600 }}>Vytvořit novou stavbu</h2>
					<button
						className="modal-form__btn"
						type="button"
						onClick={() => {
							setModalFormVisible(false);
							setError(null);
						}}
					>
						Zavřít
					</button>
				</div>
				<input
					onChange={(e) => setModalFormData(e.target.value)}
					value={modalFormData}
					className="input"
					type="text"
					placeholder="Zadejte název stavby"
				/>
				{error && <p style={{ color: "#f00" }}>{error}</p>}
				<button className="modal-form__btn" type="submit">
					{loading ? (
						<LoadingSpinner />
					) : (
						<>
							<PlusIconSmall />
							<span>Přidat</span>
						</>
					)}
				</button>
			</form>
			<div
				onClick={() => setModalFormVisible(false)}
				className={classNames("curtain", {
					"curtain--visible": modalFormVisible,
				})}
			></div>
			{/* TODO: aside tag is for sidebars */}
			<aside className="sidebar">
				<div className="sidebar-wrapper">
					<div style={{ padding: "10px 0" }}>
						<button
							onClick={() => setSidebarTeam((prev) => !prev)}
							className="sidebar__title-btn"
						>
							<TeamIcon size={20} />
							<h2>Tým</h2>
						</button>
					</div>
					<div
						className={classNames("sidebar-wrapper-inner", {
							"sidebar-wrapper-inner--visible": sidebarTeam,
						})}
					>
						<div className="sidebar-container">
							{allUsers.map((user) => {
								return (
									<NavLink
										className={({ isActive }) =>
											classNames("sidebar__link", {
												"sidebar__link--active": isActive,
											})
										}
										key={user._id}
										to={`/users/${user._id}`}
									>
										<span className="avatar">
											{user.name.split(" ")[0][0] + user.name.split(" ")[1][0]}
										</span>
										<span>{user.name}</span>
									</NavLink>
								);
							})}
						</div>
					</div>
				</div>
				<div className="sidebar-wrapper">
					<div
						style={{
							display: "flex",
							justifyContent: "space-between",
							alignItems: "center",
							padding: "5px 0",
						}}
					>
						<button
							onClick={() => setSidebarBuildings((prev) => !prev)}
							className="sidebar__title-btn"
						>
							<BuildingIcon size={20} />
							<h2>Stavby</h2>
						</button>
						<button
							onClick={() => setModalFormVisible(true)}
							className="sidebar__btn"
						>
							<PlusIcon size={16} />
						</button>
					</div>
					<div
						className={classNames("sidebar-wrapper-inner", {
							"sidebar-wrapper-inner--visible": sidebarBuildings,
						})}
					>
						<div className="sidebar-container">
							{buildings.map((building) => {
								return (
									<NavLink
										key={building._id}
										className={({ isActive }) =>
											classNames("sidebar__link", {
												"sidebar__link--active": isActive,
											})
										}
										to={`/buildings/${building._id}`}
									>
										{building.name}
									</NavLink>
								);
							})}
						</div>
					</div>
				</div>
				<StatusIndicator error={error} loading={loading} />
			</aside>
		</>
	);
};

export default Sidebar;
