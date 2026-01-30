import { useState } from "react";
import { NavLink } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import classNames from "classnames";
import TeamIcon from "../../icons/TeamIcon";
import BuildingIcon from "../../icons/BuildingIcon";
import PlusIcon from "../../icons/PlusIcon";
import logo from "/logo/logo-black.png";
import "./Header.scss";
import ToolsIcon from "../../icons/ToolsIcon";

const Header = ({ allUsers, buildings, setModalFormVisible }) => {
	const { user, setUser } = useAuth();

	const [menuVisible, setMenuVisible] = useState(false);
	const [modalOpen, setModalOpen] = useState(false);

	const navigate = useNavigate();

	// TODO: learn this
	const handleLogout = () => {
		localStorage.removeItem("token");
		localStorage.removeItem("user");
		setUser(null);
		navigate("/login", { replace: true });
		setModalOpen(false);
	};

	const handleMenu = () => setMenuVisible((prev) => !prev);

	return (
		<>
			<div
				className={classNames("header-modal", {
					"header-modal--visible": modalOpen,
				})}
			>
				<p style={{ fontWeight: 600 }}>Opravdu se chcete odhlásit?</p>
				<button
					style={{ background: "var(--red-clr)" }}
					className="header-modal__btn"
					onClick={handleLogout}
				>
					Odhlásit se
				</button>
				<button
					style={{ background: "#000" }}
					className="header-modal__btn"
					onClick={() => setModalOpen(false)}
				>
					Zrušit
				</button>
			</div>
			<div
				onClick={() => setModalOpen(false)}
				className={classNames("header__curtain", {
					"header__curtain--visible": modalOpen,
				})}
			></div>
			<header className="header">
				<NavLink className="header__logo" to="/">
					<img src={logo} alt="Neresen a.s. logo" />
					<span className="header__logo-title">
						<span>
							<span style={{ fontWeight: 600 }}>NERESEN</span> a.s.
						</span>
						<span>Řízení práce a plánovač úkolů</span>
					</span>
				</NavLink>
				<div
					style={{
						display: "flex",
						justifyContent: "center",
						alignItems: "center",
						gap: 5,
					}}
				>
					{user ? (
						<button onClick={() => setModalOpen(true)} className="header__btn">
							Odhlásit se
						</button>
					) : (
						<div style={{ display: "flex", gap: 10 }}>
							<NavLink className="header__link" to="/login">
								Prihlasit se
							</NavLink>
							<NavLink className="header__link" to="/register">
								Registrace
							</NavLink>
						</div>
					)}
					<button onClick={handleMenu} className="menu-btn">
						menu
					</button>
				</div>
			</header>

			{/* menu */}

			<div
				className={classNames("menu", {
					"menu--visible": menuVisible,
				})}
			>
				<div className="sidebar-wrapper">
					<div style={{ padding: "10px 0" }}>
						<div className="sidebar__title-btn">
							<TeamIcon size={20} />
							<h2>Tým</h2>
						</div>
					</div>
					<div className="sidebar-wrapper-inner sidebar-wrapper-inner--visible">
						<div className="sidebar-container">
							{allUsers.map((user) => {
								// TODO: learn this
								const [firstName, lastName] = user.name.split(" ");

								return (
									<NavLink
										key={user._id}
										onClick={() => setMenuVisible(false)}
										className={({ isActive }) =>
											classNames("sidebar__link", {
												"sidebar__link--active": isActive,
											})
										}
										to={`/users/${user._id}`}
									>
										<span className="avatar">
											{firstName.charAt(0) + lastName.charAt(0)}
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
						<div className="sidebar__title-btn">
							<BuildingIcon size={20} />
							<h2>Stavby</h2>
						</div>
						<button
							onClick={() => setModalFormVisible(true)}
							className="sidebar__btn"
						>
							<PlusIcon size={16} />
						</button>
					</div>
					<div className="sidebar-wrapper-inner sidebar-wrapper-inner--visible">
						<div className="sidebar-container">
							{buildings.map((building) => {
								return (
									<NavLink
										key={building._id}
										onClick={() => setMenuVisible(false)}
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
				<NavLink
					style={{ borderRadius: 10 }}
					onClick={() => setMenuVisible(false)}
					className={({ isActive }) =>
						classNames("sidebar__link", {
							"sidebar__link--active": isActive,
						})
					}
					to="/tools"
				>
					<ToolsIcon size={20} />
					<span>Nářadí</span>
				</NavLink>
				<p className="menu__author">
					Created by <a href="https://www.heeeyooo.studio/">heeeyooo studio</a>
				</p>
			</div>
		</>
	);
};

export default Header;
