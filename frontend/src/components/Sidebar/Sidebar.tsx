import { useAuth } from "../../context/AuthContext";
import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import classNames from "classnames";
import TeamIcon from "../../icons/TeamIcon";
import BuildingIcon from "../../icons/BuildingIcon";
import api from "../../axios";
import "./Sidebar.scss";

const Sidebar = ({ allUsers, buildings, setBuildings }) => {
	const { user } = useAuth();
	const [modalFormVisible, setModalFormVisible] = useState(false);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [modalFormData, setModalFormData] = useState("");

	useEffect(() => {
		const fetchBuildingData = async () => {
			setLoading(true);
			setError(null);

			try {
				const res = await api.get(`/api/buildings/all`);

				setBuildings(res.data);
			} catch (err) {
				setError(err.message);
			} finally {
				setLoading(false);
			}
		};

		fetchBuildingData();
	}, []);

	const saveBuildingData = async () => {
		setLoading(true);
		setError(null);

		try {
			const res = await api.post(`/api/buildings`, { name: modalFormData });

			setBuildings((prev) => [...prev, res.data]);
			setModalFormVisible(false);
			setModalFormData("");
		} catch (error) {
			// TODO: LEARN THIS
			setError(error.response.data.message);
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
					saveBuildingData();
				}}
				className={classNames("modal-form", {
					"modal-form--visible": modalFormVisible,
				})}
			>
				<div style={{ display: "flex", justifyContent: "space-between" }}>
					<h2>Create new building</h2>
					<button
						className="modal-form__btn"
						type="button"
						onClick={() => setModalFormVisible(false)}
					>
						Close
					</button>
				</div>
				<input
					onChange={(e) => setModalFormData(e.target.value)}
					value={modalFormData}
					className="input"
					type="text"
					placeholder="Enter building name"
				/>
				<p>{error}</p>
				<button className="modal-form__btn" type="submit">
					Submit
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
				<div className="container-title">
					<TeamIcon size={20} />
					<h2>Tým</h2>
				</div>
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
				<div
					style={{
						display: "flex",
						justifyContent: "space-between",
						alignItems: "center",
					}}
				>
					<div className="container-title">
						<BuildingIcon size={20} />
						<h2>Stavby</h2>
					</div>
					<button
						onClick={() => setModalFormVisible(true)}
						className="sidebar__btn"
					>
						+
					</button>
				</div>
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
			</aside>
		</>
	);
};

export default Sidebar;
