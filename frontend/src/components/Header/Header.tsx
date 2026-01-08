import { NavLink } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import logo from "/logo/logo-black.png";
import "./Header.scss";
import { useAuth } from "../../context/AuthContext";

const Header = () => {
	const { user, setUser } = useAuth();

	const navigate = useNavigate();

	// TODO: learn this
	const handleLogout = () => {
		localStorage.removeItem("token");
		localStorage.removeItem("user");
		setUser(null);
		navigate("/login", { replace: true });
	};

	return (
		<header className="header">
			<NavLink className="header__logo" to="/">
				<img src={logo} alt="" />
				<span style={{ display: "flex", flexDirection: "column" }}>
					<span>NERESEN a.s.</span>
					<span>Říyení práce a plánovač úkolů</span>
				</span>
			</NavLink>
			<div>
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
			</div>
		</header>
	);
};

export default Header;
