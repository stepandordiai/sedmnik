import {
	BrowserRouter as Router,
	Routes,
	NavLink,
	Route,
} from "react-router-dom";
import UserPage from "./pages/UserPage/UserPage";
import usersData from "./assets/data/users-data.json";
import classNames from "classnames";
import Home from "./pages/Home/Home";
import "./scss/App.scss";

function App() {
	return (
		<Router>
			<div className="wrapper">
				<div className="sidebar">
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
				</div>

				<Routes>
					<Route path="/" element={<Home />} />
					<Route path="/user-page/:id" element={<UserPage />} />
				</Routes>
			</div>
		</Router>
	);
}

export default App;
