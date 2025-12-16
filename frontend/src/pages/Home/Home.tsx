import { useEffect, useRef, useState } from "react";
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
const yearNow = dateNow.getFullYear();

const Home = () => {
	interface User {
		date: string;
		people: {
			name: string;
			notes: string;
		}[];
		updatedAt: Date;
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

	const [loading, setLoading] = useState(false);

	const [inputData, setInputData] = useState<InputData>({
		date: dateNow,
		people: [],
	});

	const [dropdownVisible, setDropdownVisible] = useState(() =>
		new Array(usersData.length).fill(false)
	);

	const handleDropdonwVisible = (index: number) => {
		setDropdownVisible((prev) => {
			const updated = [...prev];
			updated[index] = !updated[index];
			return updated;
		});
	};

	const popUp = useRef<HTMLDivElement>(null);

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

	const updateUsersData = async () => {
		setLoading(true);
		try {
			await new Promise((resolve) => setTimeout(resolve, 1000));
			await axios.put("https://weekly-planner-backend.onrender.com/api", {
				...inputData,
				date: inputData.date.toISOString(),
			});
		} catch (error) {
			console.log(error);
		} finally {
			setLoading(false);

			popUp.current && popUp.current.classList.add("pop-up--visible");

			setTimeout(() => {
				popUp.current && popUp.current.classList.remove("pop-up--visible");
			}, 3000);
		}
	};

	const todayKey = new Date().toISOString().slice(0, 10);

	const usersDayNow = userData.find((u) => u.date.slice(0, 10) === todayKey);

	const lastWeek = userData.slice(-6);

	useEffect(() => {
		if (!usersData?.length) return;

		const people = usersData.map((user) => {
			const existing = usersDayNow?.people.find((p) => p.name === user.name);

			return {
				name: user.name,
				notes: existing?.notes || "",
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
		<>
			<div ref={popUp} className="pop-up">
				Informace aktualizovány!
			</div>
			<main className="home">
				<div style={{ marginBottom: 20 }}>
					<p style={{ fontSize: "2rem" }}>
						{dayNow}, {monthNow} {date}
					</p>
					<p>
						{yearNow}-{month + 1}-{date}
					</p>
				</div>
				<div className="home-users-container">
					{inputData.people.map((person, i) => (
						<div className="home-user-container" key={person.name}>
							<button
								className={`btn ${dropdownVisible[i] ? "btn--active" : ""}`}
								onClick={() => handleDropdonwVisible(i)}
							>
								<div
									style={{
										display: "flex",
										justifyContent: "center",
										alignItems: "center",
										gap: 5,
									}}
								>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										width="16"
										height="16"
										fill="currentColor"
										className="bi bi-arrow-right-square-fill"
										viewBox="0 0 16 16"
									>
										<path d="M0 14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2a2 2 0 0 0-2 2zm4.5-6.5h5.793L8.146 5.354a.5.5 0 1 1 .708-.708l3 3a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708-.708L10.293 8.5H4.5a.5.5 0 0 1 0-1" />
									</svg>
									<p style={{ fontSize: "1.2rem" }}>{person.name}</p>
								</div>
								{/* <p>
									{userData.length > 0
										? userData[0].updatedAt.toString().slice(11, 16)
										: ""}
								</p> */}
							</button>
							<div
								className={`dd-container ${
									dropdownVisible[i] ? "dd-container--visible" : ""
								}`}
							>
								<div
									style={{
										overflow: "hidden",
										padding: "0 20px",
										display: "flex",
										flexDirection: "column",
									}}
								>
									{lastWeek.map((day, index) => {
										const correctHours = new Date(day.updatedAt).getHours();
										const correctMinutes = new Date(day.updatedAt).getMinutes();
										const correctDay = new Date(day.updatedAt).getDay();

										return day.people.map((user) => {
											return (
												user.name === person.name && (
													<div
														style={{
															display: "flex",
															flexDirection: "column",
															justifyContent: "center",
															alignItems: "flex-start",
														}}
													>
														<div
															style={{
																display: "flex",
																justifyContent: "space-between",
																width: "100%",
																margin: "5px 0",
															}}
														>
															<span style={{ fontWeight: 600 }}>
																{weekData[correctDay - 1]}
															</span>{" "}
															<span>
																{person.name === user.name &&
																	day.date.slice(0, 10)}
															</span>{" "}
															<span>
																{correctHours}:
																{correctMinutes.toString().padStart(2, "0")}
															</span>
														</div>
														{index !== lastWeek.length - 1 && (
															<p className="week-notes">
																{index !== lastWeek.length - 1 &&
																	person.name === user.name &&
																	user.notes}
															</p>
														)}
													</div>
												)
											);
										});
									})}
									<textarea
										value={person.notes}
										onChange={(e) =>
											handlePersonChange(i, "notes", e.target.value)
										}
										className="textarea"
										rows={5}
									/>
									<div
										style={{
											display: "flex",
											justifyContent: "flex-end",
											gap: 10,
										}}
									>
										<button className="reset-btn" onClick={() => clearNotes(i)}>
											Smazat
										</button>
										<button onClick={updateUsersData} className="submit-btn">
											{loading ? (
												<span className="circle-loading">
													<span></span>
												</span>
											) : (
												"Uložit"
											)}
										</button>
									</div>
								</div>
							</div>
						</div>
					))}
				</div>
			</main>
		</>
	);
};

export default Home;
