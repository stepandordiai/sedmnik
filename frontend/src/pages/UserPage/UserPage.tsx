import Weekbar from "../../components/Weekbar/Weekbar";
import { useParams } from "react-router-dom";
import Visit from "../../components/Visit/Visit";
import { useAuth } from "../../context/AuthContext";
import Responsibilities from "../../components/Responsibilities/Responsibilities";
import { useState } from "react";
import Plan from "../../components/Plan/Plan";
import Period from "../../components/Period/Period";
import classNames from "classnames";
import Footer from "../../components/layout/Footer/Footer";
import "./UserPage.scss";

const UserPage = ({ allUsers }) => {
	const { user } = useAuth();
	const { id } = useParams<string>();
	const today = new Date();

	// TODO: learn this
	const toLocalDateString = (date: Date) => {
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, "0");
		const day = String(date.getDate()).padStart(2, "0");
		return `${year}-${month}-${day}`;
	};

	const [shiftDate, setShiftDate] = useState(toLocalDateString(today));
	const [isWeek, setIsWeek] = useState(false);
	const [periodActive, setPeriodActive] = useState(false);

	const currentUserPage = allUsers.find((user) => user._id === id);

	return (
		<main className="main">
			<div
				style={{
					display: "flex",
					justifyContent: "flex-start",
					alignItems: "center",
					gap: 5,
				}}
			>
				<button
					style={{ justifyContent: "flex-end", width: "max-content" }}
					className={classNames("switch-btn", {
						"switch-btn--active": periodActive,
					})}
					onClick={() => setPeriodActive((prev) => !prev)}
				></button>
				<span style={{ fontWeight: 600 }}>Export</span>
			</div>
			{periodActive ? (
				<Period allUsers={allUsers} userId={id} />
			) : (
				<>
					<section className="section">
						<h1 style={{ fontSize: "2rem" }}>{currentUserPage?.name}</h1>
					</section>
					<Weekbar
						shiftDate={shiftDate}
						setShiftDate={setShiftDate}
						isWeek={isWeek}
						setIsWeek={setIsWeek}
					/>
					<Visit
						key={user?._id}
						userId={id}
						currentUser={user}
						shiftDate={shiftDate}
						setShiftDate={setShiftDate}
						isWeek={isWeek}
					/>

					<Responsibilities
						shiftDate={shiftDate}
						userId={id}
						currentUser={user}
						isWeek={isWeek}
					/>
					<Plan userId={id} currentUser={user} />
				</>
			)}
			<Footer />
		</main>
	);
};

export default UserPage;
