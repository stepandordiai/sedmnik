import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import classNames from "classnames";
import WorkSchedule from "../../components/WorkSchedule/WorkSchedule";
import OrderedAndPurchasedItems from "../../components/OrderedAndPurchasedItems/OrderedAndPurchasedItems";
import { useAuth } from "../../context/AuthContext";
import StatusIndicator from "../../components/StatusIndicator/StatusIndicator";
import api from "../../axios";
import "./BuildingPage.scss";
import ChatIcon from "../../icons/ChatIcon";

const BuildingPage = ({ buildings }) => {
	const { id } = useParams();
	const { user } = useAuth();

	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);

	interface Comment {
		id: string;
		name: string;
		text: string;
		createdAt: string;
		color: {
			r: number;
			g: number;
			b: number;
		};
	}

	const [comments, setComments] = useState<Comment[]>([]);

	const [formData, setFormData] = useState({
		name: user?.name,
		text: "",
	});

	const [buildingOption, setBuildingOption] = useState<string>("Materiály");

	const building = buildings.find((b) => b._id === id);

	const handleComment = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	useEffect(() => {
		const getComments = async () => {
			if (!id) return;
			setLoading(true);
			setError(null);

			try {
				const res = await api.get(`/api/buildings/${id}/comments`);

				setComments(res.data);
			} catch (err) {
				setError(err.response?.data.message);
			} finally {
				setLoading(false);
			}
		};

		getComments();
	}, [id]);

	const saveComment = async (e) => {
		e.preventDefault();
		if (!id) return;
		if (!formData.text.trim()) return;
		setLoading(true);
		setError(null);

		try {
			const res = await api.post(`/api/buildings/${id}/comments`, {
				name: formData.name,
				text: formData.text.trim(),
				color: user.color,
			});

			setComments((prev) => [...prev, res.data]);

			setFormData((prev) => ({ ...prev, text: "" }));
		} catch (err) {
			setError(err.response?.data.message);
		} finally {
			setLoading(false);
		}
	};

	const handleRemoveComment = async (commentId) => {
		setLoading(true);
		setError(null);
		setComments((prev) => prev.filter((comment) => comment.id !== commentId));

		try {
			await api.delete(`/api/buildings/${id}/comments/${commentId}`);
		} catch (err) {
			setError(err.response?.data.message);
		} finally {
			setLoading(false);
		}
	};

	const formatDateTimeNoSpaces = (createdAt: string) => {
		const date = new Date(createdAt);

		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, "0");
		const day = String(date.getDate()).padStart(2, "0");

		const hours = String(date.getHours()).padStart(2, "0");
		const minutes = String(date.getMinutes()).padStart(2, "0");

		return `${hours}:${minutes} ${year}-${month}-${day}`;
	};

	return (
		<main className="main">
			<div style={{ display: "flex", gap: 5 }}>
				<button
					onClick={() => setBuildingOption("Materiály")}
					className={classNames("building-page__btn", {
						"building-page__btn--active": buildingOption == "Materiály",
					})}
				>
					Materiály
				</button>
				<button
					onClick={() => setBuildingOption("Harmonogram")}
					className={classNames("building-page__btn", {
						"building-page__btn--active": buildingOption == "Harmonogram",
					})}
				>
					Harmonogram
				</button>
			</div>
			{buildingOption === "Materiály" ? (
				<>
					<OrderedAndPurchasedItems id={id} building={building} />
					<section className="section">
						<div className="container-title">
							<ChatIcon size={20} />
							<h2>Poznamky</h2>
						</div>
						<div
							style={{
								display: "flex",
								flexDirection: "column",
								gap: 5,
							}}
						>
							{comments.map((comment, i) => {
								return (
									<div
										style={{
											display: "flex",
											justifyContent: "space-between",
											alignItems: "flex-start",
											padding: 5,
											borderRadius: 5,
											backgroundColor: `rgba(${comment.color?.r}, ${comment.color?.g}, ${comment.color?.b}, 0.1)`,
										}}
										key={i}
									>
										<div>
											<p style={{ color: "var(--accent-clr)" }}>
												{comment.name}
											</p>
											<p>{comment.text}</p>
										</div>
										<p>
											{/* TODO: learn this */}
											{/* {new Date(comment.createdAt).toLocaleTimeString([], {
												hour: "2-digit",
												minute: "2-digit",
											})} */}
											{/* {new Date(comment.createdAt)
												.toLocaleString("cs-CZ", {
													hour: "2-digit",
													minute: "2-digit",
													day: "2-digit",
													month: "2-digit",
													year: "numeric",
												})
												.replace(/\.\s/g, ".")} */}
											{formatDateTimeNoSpaces(comment.createdAt)}
										</p>
										<button onClick={() => handleRemoveComment(comment.id)}>
											X
										</button>
									</div>
								);
							})}
						</div>
						<form onSubmit={saveComment}>
							<textarea
								onChange={(e) => handleComment(e)}
								value={formData.text}
								className="input"
								style={{ width: "100%" }}
								name="text"
								rows={3}
								placeholder="Napište zprávu..."
							></textarea>
							<button
								style={{ marginLeft: "auto" }}
								className="btn"
								type="submit"
							>
								Odeslat
							</button>
						</form>
						<StatusIndicator error={error} loading={loading} />
					</section>
				</>
			) : (
				<WorkSchedule id={id} building={building} />
			)}
		</main>
	);
};

export default BuildingPage;
