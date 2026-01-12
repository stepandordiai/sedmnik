import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home/Home";
import Header from "./components/Header/Header";
import Sidebar from "./components/Sidebar/Sidebar";
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import { useState, useEffect } from "react";
import axios from "axios";
// import { Navigate } from "react-router-dom";
import UserPage from "./pages/UserPage/UserPage";
import { useAuth } from "./context/AuthContext";
import Preload from "./components/Preload/Preload";
import "./scss/App.scss";

function App() {
	const { user } = useAuth();
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);
	const [preloader, setPreloader] = useState(true);
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

	// useEffect(() => {
	// 	const fetchUser = async () => {
	// 		const token = localStorage.getItem("token");
	// 		if (token) {
	// 			try {
	// 				const response = await axios.get(
	// 					`${import.meta.env.VITE_API_URL}/api/users/me`,
	// 					{
	// 						headers: { Authorization: `Bearer ${token}` },
	// 					}
	// 				);
	// 				setUser(response.data);
	// 			} catch (err) {
	// 				// TODO:
	// 				setError(err instanceof Error ? err.message : "An error occurred");
	// 				localStorage.removeItem("token");
	// 			} finally {
	// 				// setIsLoading(false);
	// 			}
	// 		}
	// 	};

	// 	fetchUser();
	// }, []);

	useEffect(() => {
		const wakeUpApi = async () => {
			setLoading(true);
			try {
				await new Promise((resolve) => setTimeout(resolve, 1000));
				await axios.get(`${import.meta.env.VITE_API_URL}/health`);
			} catch (error) {
				setError(error);
			} finally {
				setLoading(false);
				await new Promise((resolve) => setTimeout(resolve, 500));
				setPreloader(false);
			}
		};

		wakeUpApi();
	}, []);

	if (preloader) {
		return <Preload loading={loading} />;
	}

	return (
		<Router>
			<div className="wrapper">
				<Header />
				<div className="wrapper-inner">
					<Sidebar allUsers={allUsers} />
					<Routes>
						<Route path="/" element={<Home error={error} />} />
						<Route path="/login" element={<Login />} />
						<Route path="/register" element={<Register />} />
						<Route
							path="/users/:id"
							element={<UserPage allUsers={allUsers} />}
						/>
					</Routes>
				</div>
			</div>
		</Router>
	);
}

export default App;
