import { useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import { NavLink } from "react-router-dom";
import "./Register.scss";
import { useAuth } from "../../context/AuthContext";

const Register = () => {
	const { setUser } = useAuth();
	const navigate = useNavigate();

	const [formData, setFormData] = useState({
		name: "",
		username: "",
		password: "",
	});

	const [error, setError] = useState("");

	const handleChange = (e) => {
		// TODO:
		setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		try {
			const res = await axios.post(
				`${import.meta.env.VITE_API_URL}/api/register`,
				formData
			);
			localStorage.setItem("token", res.data.token);
			// Save user object
			localStorage.setItem("user", JSON.stringify(res.data));
			setUser(res.data);
			navigate("/");
			// TODO: LEARN THIS
		} catch (err) {
			setError(err.response?.data.message);
			console.error("Full Error Object:", err.response?.data.message);
		}
	};
	return (
		<div className="register">
			<div className="register-container">
				<h1 style={{ fontSize: "2rem", marginBottom: 25 }}>Registrace</h1>
				{error && <p style={{ color: "red", marginBottom: 10 }}>{error}</p>}
				{/* TODO: */}
				<form className="register-form" action="" onSubmit={handleSubmit}>
					<div className="register-input-container">
						<label htmlFor="name">Jméno a příjmení</label>
						<input
							id="name"
							className="register__input"
							type="text"
							name="name"
							value={formData.name}
							onChange={handleChange}
							placeholder="Zadejte své jméno a příjmení"
							required
							// TODO:
							autoComplete="off"
						/>
					</div>
					<div className="register-input-container">
						<label htmlFor="username">Uživatelské jméno</label>
						<input
							id="username"
							className="register__input"
							type="text"
							name="username"
							value={formData.username}
							onChange={handleChange}
							placeholder="Zadejte své uživatelské jméno"
							required
							// TODO:
							autoComplete="off"
						/>
					</div>
					<div className="register-input-container">
						<label htmlFor="password">Heslo</label>
						<input
							className="register__input"
							id="password"
							type="password"
							name="password"
							value={formData.password}
							onChange={handleChange}
							placeholder="Zadejte své heslo"
							required
						/>
					</div>
					<button className="register__btn">Vytvořit účet</button>
				</form>
				<div style={{ marginTop: 25 }}>
					<span>Už máte účet?</span>{" "}
					<NavLink style={{ textDecoration: "underline" }} to="/login">
						Přihlaste se
					</NavLink>
				</div>
			</div>
		</div>
	);
};

export default Register;
