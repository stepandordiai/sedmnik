import { NavLink } from "react-router-dom";
import "./Home.scss";

const Home = ({ user, error }) => {
	return (
		<>
			<main className="home">
				<div>{error && <p>{error}</p>}</div>
				{user ? (
					<div
						style={{
							display: "flex",
							flexDirection: "column",
							alignItems: "center",
							textAlign: "center",
						}}
					>
						<p style={{ fontSize: "2rem", marginBottom: 25 }}>
							Vítej, {user.username}!
						</p>
						<NavLink className="home__link" to={`/users/${user._id}`}>
							Přejít na můj profil
						</NavLink>
					</div>
				) : (
					<div
						style={{
							display: "flex",
							flexDirection: "column",
							alignItems: "center",
							textAlign: "center",
						}}
					>
						<p style={{ fontSize: "2rem", marginBottom: 25 }}>
							Vítejte na stránkách společnosti Neresen a.s.
						</p>
						<p style={{ marginBottom: 10 }}>
							Prosím, přihlaste se nebo se zaregistrujte, abyste získali
							přístup.
						</p>
						<div style={{ display: "flex", gap: 5 }}>
							<NavLink className="home__link" to="/login">
								Prihlasit se
							</NavLink>
							<NavLink className="home__link" to="/register">
								Registrace
							</NavLink>
						</div>
					</div>
				)}
			</main>
		</>
	);
};

export default Home;
