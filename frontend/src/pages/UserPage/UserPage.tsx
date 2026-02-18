import Weekbar from "../../components/Weekbar/Weekbar";
import { useParams } from "react-router-dom";
import Visit from "../../components/Visit/Visit";
import { useAuth } from "../../context/AuthContext";
import Responsibilities from "../../components/Responsibilities/Responsibilities";
import { useState } from "react";
import Plan from "../../components/Plan/Plan";
import Period from "../../components/Period/Period";
import classNames from "classnames";
import "./UserPage.scss";
import Footer from "../../components/layout/Footer/Footer";

const UserPage = ({ allUsers }) => {
	const { user } = useAuth();
	const { id } = useParams<string>();
	const today = new Date();

	const [shiftDate, setShiftDate] = useState(today.toISOString().split("T")[0]);
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
					<Plan userId={id} />
				</>
			)}
			<Footer />
		</main>
	);
};

export default UserPage;
