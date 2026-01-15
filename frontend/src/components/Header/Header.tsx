import { useState } from "react";
import { NavLink } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import classNames from "classnames";
import TeamIcon from "../../icons/TeamIcon";
import logo from "/logo/logo-black.png";
import "./Header.scss";

const Header = ({ allUsers }) => {
	const { user, setUser } = useAuth();
	const [menuVisible, setMenuVisible] = useState(false);

	const navigate = useNavigate();

	// TODO: learn this
	const handleLogout = () => {
		localStorage.removeItem("token");
		localStorage.removeItem("user");
		setUser(null);
		navigate("/login", { replace: true });
	};

	const handleMenu = () => setMenuVisible((prev) => !prev);

	return (
		<>
			<header className="header">
				<NavLink className="header__logo" to="/">
					<img src={logo} alt="Neresen a.s. logo" />
					<span className="header__logo-title">
						<span>NERESEN a.s.</span>
						<span>Říyení práce a plánovač úkolů</span>
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
						<button onClick={handleLogout} className="header__btn">
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
			<div
				className={classNames("menu", {
					"menu--visible": menuVisible,
				})}
			>
				<div className="container-title">
					<TeamIcon size={20} />
					<h2>Tým</h2>
				</div>
				<div className="sidebar-container">
					{allUsers.map((user) => {
						return (
							<NavLink
								onClick={() => setMenuVisible(false)}
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
		</>
	);
};

export default Header;
