import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import classNames from "classnames";
import TeamIcon from "../../../icons/TeamIcon";
import BuildingIcon from "../../../icons/BuildingIcon";
import PlusIcon from "../../../icons/PlusIcon";
import logo from "/logo/logo-black.png";
import ToolsIcon from "../../../icons/ToolsIcon";
import StoreIcon from "../../../icons/StoreIcon";
import PersonIcon from "../../../icons/PersonIcon";
import type { Building } from "../../../interfaces";
import { extractNameInitials } from "../../../utils/helpers";
import "./Header.scss";

const Header = ({
	allUsers,
	setBuildings,
	buildings,
	setError,
	setModalFormVisible,
}) => {
	const { user, setUser } = useAuth();

	const [menuVisible, setMenuVisible] = useState(false);
	const [modalOpen, setModalOpen] = useState(false);

	const navigate = useNavigate();

	// TODO: learn this
	const handleLogout = () => {
		localStorage.removeItem("token");
		localStorage.removeItem("user");
		setUser(null);
		setBuildings(null);
		navigate("/login", { replace: true });
		setModalOpen(false);
		setMenuVisible(false);
	};

	useEffect(() => {
		if (!user) {
			setError("Nemáte oprávnění k přístupu.");
			return;
		}

		setError(null);
	});

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
				<NavLink
					onClick={() => setMenuVisible(false)}
					className="header__logo"
					to="/"
				>
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
							<NavLink
								onClick={() => setMenuVisible(false)}
								className="header__link"
								to="/register"
							>
								Registrace
							</NavLink>
							<NavLink
								onClick={() => setMenuVisible(false)}
								className="header__link"
								to="/login"
							>
								Prihlasit se
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
				<div className="menu-inner">
					{!user ? null : (
						<>
							<div className="sidebar-wrapper">
								<div style={{ padding: "10px 0" }}>
									<div className="sidebar__title-btn">
										<TeamIcon size={20} />
										<h2>Tým</h2>
									</div>
								</div>
								<div className="sidebar-wrapper-inner sidebar-wrapper-inner--visible">
									<div className="sidebar-container">
										{allUsers
											.filter((u) => u._id !== user._id)
											.map((user) => {
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
															{user.name ? extractNameInitials(user.name) : ""}
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
										{buildings?.map((building: Building) => {
											return (
												<NavLink
													key={building.id}
													onClick={() => setMenuVisible(false)}
													className={({ isActive }) =>
														classNames("sidebar__link", {
															"sidebar__link--active": isActive,
														})
													}
													to={`/buildings/${building.id}`}
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
								<span style={{ fontWeight: 600 }}>Nářadí</span>
							</NavLink>
						</>
					)}
					<a
						style={{ borderRadius: 10 }}
						className="sidebar__link"
						href="https://neresen-as.odoo.com/odoo/action-288"
						target="_blank"
					>
						<StoreIcon size={20} />
						<span style={{ fontWeight: 600 }}>Složení "Tatra"</span>
					</a>
					<NavLink
						style={{ borderRadius: 10 }}
						onClick={() => setMenuVisible(false)}
						className={({ isActive }) =>
							classNames("sidebar__link", {
								"sidebar__link--active": isActive,
							})
						}
						to="/leads"
					>
						<PersonIcon size={20} />
						<span style={{ fontWeight: 600 }}>Potenciální pracovníci</span>
					</NavLink>
				</div>
				<div
					style={{
						position: "sticky",
						bottom: 0,
						left: 0,
						right: 0,
						background: "#fff",
						marginTop: "auto",
						padding: 10,
					}}
				>
					<NavLink
						style={{ borderRadius: 10 }}
						className={({ isActive }) =>
							classNames("sidebar__link", {
								"sidebar__link--active": isActive,
							})
						}
						key={user?._id}
						to={`/users/${user?._id}`}
					>
						<span className="avatar">
							{user?.name ? extractNameInitials(user.name) : ""}
						</span>
						<span>{user?.name}</span>
					</NavLink>
				</div>
			</div>
		</>
	);
};

export default Header;
