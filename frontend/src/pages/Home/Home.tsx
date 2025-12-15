import { useEffect, useState } from "react";
import usersData from "./../../assets/data/users-data.json";
import axios from "axios";
import "./Home.scss";

const weekData = [
	"Monday",
	"Tuesday",
	"Wednesday",
	"Thursday",
	"Friday",
	"Saturday",
	"Sunday",
];

const monthData = [
	"January",
	"February",
	"March",
	"April",
	"May",
	"June",
	"July",
	"August",
	"September",
	"October",
	"November",
	"December",
];

const dateNow = new Date();
const correctDate = dateNow.getDay() === 0 ? 6 : dateNow.getDay() - 1;
const dayNow = weekData[correctDate];
const month = dateNow.getMonth();
const date = dateNow.getDate();
const monthNow = monthData[month];
const yearNow = dateNow.getFullYear();

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

	const [userData, setUserData] = useState<User[] | null>([]);

	const [loading, setLoading] = useState(false);

	const [inputData, setInputData] = useState<InputData>({
		date: new Date(),
		people: [],
	});

	useEffect(() => {
		const getUsersData = async () => {
			setLoading(true);
			try {
				const response = await axios.get(
					"https://weekly-planner-backend.onrender.com/api"
				);
				setUserData(response.data);
			} catch (error) {
				console.log(error);
			} finally {
				setLoading(false);
			}
		};

		getUsersData();
	}, []);

	const updateUsersData = async (e: any) => {
		e.preventDefault();
		try {
			await axios.put(
				"https://weekly-planner-backend.onrender.com/api",
				inputData
			);
		} catch (error) {
			console.log(error);
		}
	};

	const usersDayNow = userData?.find(
		(users) => users.date.slice(0, 10) === `${yearNow}-${month + 1}-${date}`
	);

	useEffect(() => {
		if (!usersData?.length) return;

		const people = usersData.map((user) => {
			const existingPerson = usersDayNow?.people.find(
				(p) => p.name === user.name
			);

			return {
				name: user.name,
				notes: existingPerson?.notes || "",
			};
		});

		setInputData({
			date: usersDayNow?.date ? new Date(usersDayNow.date) : new Date(),
			people,
		});
	}, [usersData, usersDayNow]);

	// TODO: LEARN THIS
	const handlePersonChange = (index: number, field: string, value: string) => {
		const updatedPeople: any = [...inputData.people];
		updatedPeople[index][field] = value;

		setInputData({
			...inputData,
			people: updatedPeople,
		});
	};

	if (loading || !userData) return;

	return (
		<main className="home">
			<p style={{ marginBottom: 50 }}>Home</p>
			<p style={{ fontSize: "2rem" }}>
				{dayNow} {monthNow} {date}
			</p>
			<div className="home-users-container">
				{usersData.map((user, i) => {
					return (
						<div className="home-user-container" key={user.id}>
							<div style={{ display: "flex", justifyContent: "space-between" }}>
								<p>{user.name}</p>
								{/* <p>{userData?.updatedAt}</p> */}
							</div>
							<form action="" onSubmit={updateUsersData}>
								{/* <input type="text" placeholder="text" /> */}
								<textarea
									value={inputData.people?.[i]?.notes ?? ""}
									onChange={(e) =>
										handlePersonChange(i, "notes", e.target.value)
									}
									className="textarea"
									name={user.name}
									id=""
									rows={5}
								></textarea>
								<div
									style={{ display: "flex", justifyContent: "space-between" }}
								>
									<input
										style={{
											background: "red",
											color: "white",
											padding: 5,
											borderRadius: 5,
										}}
										type="reset"
										value="Reset"
									/>
									<button
										style={{
											background: "green",
											color: "white",
											padding: 5,
											borderRadius: 5,
										}}
										type="submit"
									>
										Submit
									</button>
								</div>
							</form>
						</div>
					);
				})}
			</div>
		</main>
	);
};

export default Home;
