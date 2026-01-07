import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home/Home";
import Header from "./components/Header/Header";
import Sidebar from "./components/Sidebar/Sidebar";
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import { useState, useEffect } from "react";
import axios from "axios";
import { Navigate } from "react-router-dom";
import UserPage from "./pages/UserPage/UserPage";
import "./scss/App.scss";

function App() {
	const [user, setUser] = useState(null);
	const [error, setError] = useState("");
	const [isLoading, setIsLoading] = useState(true);

	console.log(user);

	useEffect(() => {
		const fetchUser = async () => {
			const token = localStorage.getItem("token");
			if (token) {
				try {
					const response = await axios.get(
						"https://weekly-planner-backend.onrender.com/api/users/me",
						{
							headers: { Authorization: `Bearer ${token}` },
						}
					);
					setUser(response.data);
				} catch (err) {
					// TODO:
					setError(err instanceof Error ? err.message : "An error occurred");
					localStorage.removeItem("token");
				}
			}
			setIsLoading(false);
		};

		fetchUser();
	}, []);

	if (isLoading) {
		return <div>Loading...</div>;
	}
	return (
		<Router>
			<div className="wrapper">
				<Header user={user} setUser={setUser} />
				<div className="wrapper-inner">
					<Sidebar />
					{/* <div style={{ display: "none" }} className="sidebar">
					<NavLink to="/">Planner</NavLink>
					<ul>
						{usersData.map((user) => {
							return (
								<li key={user.id}>
									<NavLink
										className={({ isActive }) =>
											classNames("sidebar__link", {
												"sidebar__link--active": isActive,
											})
										}
										to={`/user-page/${user.id}`}
									>
										{user.name}
									</NavLink>
								</li>
							);
						})}
					</ul>
				</div> */}
					<Routes>
						<Route path="/" element={<Home user={user} error={error} />} />
						<Route
							path="/login"
							element={user ? <Navigate to="/" /> : <Login setUser={setUser} />}
						/>
						<Route
							path="/register"
							element={
								user ? <Navigate to="/" /> : <Register setUser={setUser} />
							}
						/>
						<Route path="/users/:id" element={<UserPage />} />
						{/* <Route path="*" element={<NotFound />} /> */}
					</Routes>
				</div>
			</div>
		</Router>
	);
}

export default App;
