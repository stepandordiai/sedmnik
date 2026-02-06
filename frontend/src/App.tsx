import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home/Home";
import Header from "./components/Header/Header";
import Sidebar from "./components/Sidebar/Sidebar";
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import api from "./axios";
import UserPage from "./pages/UserPage/UserPage";
import { useAuth } from "./context/AuthContext";
import Preload from "./components/Preload/Preload";
import BuildingPage from "./pages/BuildingPage/BuildingPage";
import Tools from "./pages/Tools/Tools";
import Leads from "./pages/Leads/Leads";
import "./scss/App.scss";

function App() {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const { user, setUser } = useAuth();
	const [preloader, setPreloader] = useState(true);
	const [allUsers, setAllUsers] = useState<any[]>([]);
	const [buildings, setBuildings] = useState([]);
	const [modalFormVisible, setModalFormVisible] = useState(false);

	// TODO: learn this
	useEffect(() => {
		api
			.get("/health")
			.then(() => {
				console.log("API awake");
			})
			.catch(() => {
				console.warn("API still sleeping");
			});
	}, []);

	useEffect(() => {
		const fetchAllUsers = async () => {
			if (!user) {
				setAllUsers([]);
				return;
			}

			try {
				const res = await api.get("/api/users/all");
				setAllUsers(res.data);
			} catch (err) {
				console.error("Error fetching sidebar users", err);
				setError(err.response?.data.message);
			} finally {
				setLoading(false);
				await new Promise((resolve) => setTimeout(resolve, 500));
				setPreloader(false);
			}
		};

		fetchAllUsers();
	}, [user]);

	useEffect(() => {
		const fetchUser = async () => {
			const token = localStorage.getItem("token");
			if (token) {
				setLoading(true);
				setError(null);
				try {
					const res = await api.get("/api/users/me");
					setUser(res.data);
				} catch (err) {
					setError(err.response?.data.message);
					localStorage.removeItem("token");
				} finally {
					setLoading(false);
				}
			}
		};

		fetchUser();
	}, []);

	if (preloader && user) {
		return <Preload loading={loading} />;
	}

	return (
		<Router>
			<div className="wrapper">
				<Header
					allUsers={allUsers}
					setBuildings={setBuildings}
					buildings={buildings}
					error={error}
					setError={setError}
					loading={loading}
					setModalFormVisible={setModalFormVisible}
				/>
				<div className="wrapper-inner">
					<Sidebar
						allUsers={allUsers}
						buildings={buildings}
						setBuildings={setBuildings}
						modalFormVisible={modalFormVisible}
						setModalFormVisible={setModalFormVisible}
					/>
					<Routes>
						<Route path="/" element={<Home />} />
						<Route
							path="/login"
							element={user ? <Navigate to="/" /> : <Login />}
						/>
						<Route
							path="/register"
							element={user ? <Navigate to="/" /> : <Register />}
						/>
						<Route
							path="/users/:id"
							element={<UserPage allUsers={allUsers} />}
						/>
						<Route
							path="/buildings/:id"
							element={<BuildingPage buildings={buildings} />}
						/>
						<Route path="/tools" element={<Tools buildings={buildings} />} />
						<Route path="/leads" element={<Leads />} />
					</Routes>
				</div>
			</div>
		</Router>
	);
}

export default App;
