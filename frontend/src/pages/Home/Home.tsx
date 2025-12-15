import { useEffect, useState } from "react";
import usersData from "./../../assets/data/users-data.json";
import axios from "axios";
import "./Home.scss";

const weekData = [
	"Pondělí",
	"Úterý",
	"Středa",
	"Čtvrtek",
	"Pátek",
	"Sobota",
	"Neděle",
];

const monthData = [
	"leden",
	"únor",
	"březen",
	"duben",
	"květen",
	"červen",
	"červenec",
	"srpen",
	"září",
	"říjen",
	"listopad",
	"prosinec",
];

const dateNow = new Date();
const correctDate = dateNow.getDay() === 0 ? 6 : dateNow.getDay() - 1;
const dayNow = weekData[correctDate];
const month = dateNow.getMonth();
const date = dateNow.getDate();
const monthNow = monthData[month];

const Home = () => {
	interface User {
		date: string;
		people: {
			name: string;
			notes: string;
		}[];
		updatedAt: string;
	}

	interface Person {
		name: string;
		notes: string;
	}

	interface InputData {
		date: Date;
		people: Person[];
	}

	const [userData, setUserData] = useState<User[]>([]);

	// const [loading, setLoading] = useState(true);

	const [inputData, setInputData] = useState<InputData>({
		date: new Date(),
		people: [],
	});

	useEffect(() => {
		const getUsersData = async () => {
			try {
				const response = await axios.get(
					"https://weekly-planner-backend.onrender.com/api"
				);
				setUserData(response.data);
			} catch (error) {
				console.log(error);
			}
		};

		getUsersData();
	}, []);

	const updateUsersData = async (e: any) => {
		e.preventDefault();
		try {
			await axios.put("https://weekly-planner-backend.onrender.com/api", {
				...inputData,
				date: inputData.date.toISOString(),
			});
		} catch (error) {
			console.log(error);
		}
	};

	const todayKey = new Date().toISOString().slice(0, 10);

	const usersDayNow = userData.find((u) => u.date.slice(0, 10) === todayKey);

	useEffect(() => {
		// EDIT MODE
		if (usersDayNow?.people?.length) {
			setInputData({
				date: new Date(usersDayNow.date),
				people: usersDayNow.people,
			});
			return;
		}

		// CREATE MODE
		if (usersData?.length) {
			setInputData({
				date: new Date(),
				people: usersData.map((user) => ({
					name: user.name,
					notes: "",
				})),
			});
		}
	}, [usersDayNow, usersData]);

	// TODO: LEARN THIS
	const handlePersonChange = (index: number, field: string, value: string) => {
		const updatedPeople: any = [...inputData.people];
		updatedPeople[index][field] = value;

		setInputData({
			...inputData,
			people: updatedPeople,
		});
	};

	// TODO: LEARN THIS
	const clearNotes = (index: number) => {
		setInputData((prev) => ({
			...prev,
			people: prev.people.map((p, i) =>
				i === index ? { ...p, notes: "" } : p
			),
		}));
	};

	return (
		<main className="home">
			<p style={{ marginBottom: 50 }}>Home</p>
			<p style={{ fontSize: "2rem", marginBottom: 20 }}>
				{dayNow}, {monthNow} {date}
			</p>
			<div className="home-users-container">
				{inputData.people.map((person, i) => (
					<div className="home-user-container" key={person.name}>
						<div style={{ display: "flex", justifyContent: "space-between" }}>
							<p>{person.name}</p>
						</div>

						<form onSubmit={updateUsersData}>
							<textarea
								value={person.notes}
								onChange={(e) => handlePersonChange(i, "notes", e.target.value)}
								className="textarea"
								rows={5}
							/>

							<div style={{ display: "flex", justifyContent: "space-between" }}>
								<button
									style={{
										padding: 10,
										background: "red",
										color: "white",
										marginTop: 5,
										borderRadius: 5,
									}}
									onClick={() => clearNotes(i)}
								>
									Clear
								</button>
								<button
									style={{
										padding: 10,
										background: "green",
										color: "white",
										marginTop: 5,
										borderRadius: 5,
									}}
									type="submit"
								>
									Submit
								</button>
							</div>
						</form>
					</div>
				))}
			</div>
		</main>
	);
};

export default Home;
