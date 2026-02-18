import "./Comments.scss";
import StatusIndicator from "../StatusIndicator/StatusIndicator";
import ChatIcon from "../../icons/ChatIcon";
import XIcon from "../../icons/XIcon";
import classNames from "classnames";
import api from "../../axios";
import { useAuth } from "../../context/AuthContext";
import { useState, useEffect } from "react";

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

const Comments = ({ building }) => {
	const { user } = useAuth();

	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [comments, setComments] = useState<Comment[]>([]);
	const [modalOpen, setModalOpen] = useState(false);
	const [selectedId, setSelectedId] = useState<string | null>(null);
	const [formData, setFormData] = useState({
		name: user?.name,
		text: "",
	});

	const handleComment = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	useEffect(() => {
		const getComments = async () => {
			if (!building._id) return;
			setLoading(true);
			setError(null);

			try {
				const res = await api.get(`/api/buildings/${building._id}/comments`);

				setComments(res.data);
			} catch (err) {
				setError(err.response?.data.message);
			} finally {
				setLoading(false);
			}
		};

		getComments();
	}, [building._id]);

	const saveComment = async (e) => {
		e.preventDefault();
		if (!building._id) return;
		if (!formData.text.trim()) return;
		setLoading(true);
		setError(null);

		try {
			const res = await api.post(`/api/buildings/${building._id}/comments`, {
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

	const formatDateTimeNoSpaces = (createdAt: string) => {
		const date = new Date(createdAt);

		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, "0");
		const day = String(date.getDate()).padStart(2, "0");

		const hours = String(date.getHours()).padStart(2, "0");
		const minutes = String(date.getMinutes()).padStart(2, "0");

		return `${hours}:${minutes} ${year}-${month}-${day}`;
	};

	const deleteComment = async () => {
		if (!selectedId) return;
		setComments((prev) => prev.filter((comment) => comment.id !== selectedId));
		setSelectedId(null);
		setModalOpen(false);
		setLoading(true);
		setError(null);

		try {
			await api.delete(`/api/buildings/${building._id}/comments/${selectedId}`);
		} catch (err) {
			setError(err.response?.data?.message);
		} finally {
			setLoading(false);
		}
	};

	return (
		<>
			<div
				className={classNames("header-modal", {
					"header-modal--visible": modalOpen,
				})}
			>
				<p style={{ fontWeight: 600 }}>Opravdu chcete tuto položku smazat?</p>
				<button
					onClick={deleteComment}
					style={{ background: "var(--red-clr)" }}
					className="header-modal__btn"
				>
					Smazat
				</button>
				<button
					style={{ background: "#000" }}
					className="header-modal__btn"
					onClick={() => {
						setSelectedId(null);
						setModalOpen(false);
					}}
				>
					Zrušit
				</button>
			</div>
			<div
				onClick={() => {
					setSelectedId(null);
					setModalOpen(false);
				}}
				className={classNames("header__curtain", {
					"header__curtain--visible": modalOpen,
				})}
			></div>
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
									<p style={{ color: "var(--accent-clr)" }}>{comment.name}</p>
									<p>{comment.text}</p>
								</div>

								<p style={{ marginLeft: "auto", marginRight: 5 }}>
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
								<button
									onClick={() => {
										setSelectedId(comment.id);
										setModalOpen(true);
									}}
									className="btn--delete"
								>
									<XIcon />
								</button>
							</div>
						);
					})}
				</div>
				<form onSubmit={saveComment}>
					<textarea
						onChange={(e) => handleComment(e)}
						value={formData.text}
						className={classNames("input", {
							"input--disabled": loading,
						})}
						style={{ width: "100%" }}
						name="text"
						rows={3}
						placeholder="Napište zprávu..."
						disabled={loading}
					></textarea>
					<button style={{ marginLeft: "auto" }} className="btn" type="submit">
						Odeslat
					</button>
				</form>
				<StatusIndicator error={error} loading={loading} />
			</section>
		</>
	);
};

export default Comments;
