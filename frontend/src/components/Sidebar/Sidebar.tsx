import { NavLink } from "react-router-dom";
import TeamIcon from "../../icons/TeamIcon";
import classNames from "classnames";
import axios from "axios";
import { useEffect, useState } from "react";
import "./Sidebar.scss";

const Sidebar = ({ user }) => {
	const [allUsers, setAllUsers] = useState<any[]>([]);

	useEffect(() => {
		const fetchAllUsers = async () => {
			if (!user) {
				setAllUsers([]);
				return;
			}

			const token = localStorage.getItem("token");
			if (!token) return;

			try {
				const res = await axios.get(
					"https://weekly-planner-backend.onrender.com/api/users/all",
					{
						headers: { Authorization: `Bearer ${token}` },
					}
				);
				setAllUsers(res.data);
			} catch (err) {
				console.error("Error fetching sidebar users", err);
			}
		};

		fetchAllUsers();
	}, [user]);

	// Only render sidebar if logged in and users exist
	if (!user || allUsers.length === 0) return null;

	return (
		<div className="sidebar">
			<div style={{ display: "flex", alignItems: "center" }}>
				<TeamIcon size={16} />
				<span>Tym</span>
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
		</div>
	);
};

export default Sidebar;
