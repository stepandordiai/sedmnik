import Weekbar from "../../components/Weekbar/Weekbar";
import "./UserPage.scss";
import { useParams } from "react-router-dom";
import Visit from "../../components/Visit/Visit";
import { useAuth } from "../../context/AuthContext";

const UserPage = () => {
	const { user } = useAuth();
	const { id } = useParams<string>();

	if (!user) return <p>Loading...</p>; // wait for context to hydrate

	return (
		<main className="user-page">
			<Weekbar />
			<Visit key={user?.id} userId={id} currentUser={user} />
		</main>
	);
};

export default UserPage;
