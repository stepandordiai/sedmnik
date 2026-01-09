import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import "./Responsibilities.scss";

const emptyInput = () => ({
	// TODO: LEARN THIS
	id: crypto.randomUUID(),
	task: "",
});

const Responsibilities = ({ data = [] }) => {
	// const {user}= useAuth()

	// TODO: LEARN THIS
	const [list, setList] = useState(data.length ? data : [emptyInput()]);

	useEffect(() => {
		if (list.length === 0) setList([emptyInput()]);
	}, [list]);

	const handleAddInput = () => {
		setList((prev) => [...prev, emptyInput()]);
	};

	const handleChangeInput = (id, value) => {
		setList((prev) =>
			prev.map((item) => (item.id === id ? { ...item, task: value } : item))
		);
	};

	const handleRemoveInput = (id) => {
		setList((prev) => prev.filter((item) => item.id !== id));
	};

	return (
		<div className="responsibilities">
			<div style={{ display: "flex", justifyContent: "space-between" }}>
				<p>Strucny popis prace</p>
				<button onClick={handleAddInput} className="responsibilities__btn">
					Pridat
				</button>
			</div>
			<p style={{ color: "hsl(0, 0%, 50%)" }}>Popis prace</p>
			<div>
				{list.map((item) => {
					return (
						<div style={{ display: "flex", gap: 5 }}>
							<input
								onChange={(e) => handleChangeInput(item.id, e.target.value)}
								className="responsibilities__input"
								key={item.id}
								type="text"
								value={item.task}
								placeholder="Write down your task"
							/>
							<button
								onClick={() => handleRemoveInput(item.id)}
								disabled={list.length === 1}
							>
								Remove
							</button>
						</div>
					);
				})}
			</div>
		</div>
	);
};

export default Responsibilities;
