import Weekbar from "../../components/Weekbar/Weekbar";
import { useParams } from "react-router-dom";
import Visit from "../../components/Visit/Visit";
import { useAuth } from "../../context/AuthContext";
import Responsibilities from "../../components/Responsibilities/Responsibilities";
import { useState } from "react";
import "./UserPage.scss";

const UserPage = () => {
	const { user } = useAuth();
	const { id } = useParams<string>();
	const today = new Date();

	const [shiftDate, setShiftDate] = useState(today.toISOString().split("T")[0]);

	if (!user) return <p>Loading...</p>; // wait for context to hydrate

	return (
		<main className="user-page">
			<Weekbar />
			<Visit
				key={user?._id}
				userId={id}
				currentUser={user}
				shiftDate={shiftDate}
				setShiftDate={setShiftDate}
			/>
			<Responsibilities shiftDate={shiftDate} userId={id} />
		</main>
	);
};

export default UserPage;
