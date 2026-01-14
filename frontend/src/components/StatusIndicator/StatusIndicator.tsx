import "./StatusIndicator.scss";

const StatusIndicator = ({ loading, error }) => {
	return (
		<div
			style={{
				display: "flex",
				justifyContent: "flex-start",
				alignItems: "center",
				gap: 5,
			}}
		>
			<span
				className={`visit__status-indicator ${
					loading ? "status--loading" : error ? "status--error" : "status--ok"
				}`}
			></span>
			<span style={{ fontSize: "0.8rem" }}>
				{loading ? "Aktualizace..." : error ? error : "Aktualizováno"}
			</span>
		</div>
	);
};

export default StatusIndicator;
