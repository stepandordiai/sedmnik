import "./StatusIndicator.scss";

const StatusIndicator = ({ loading, error }) => {
	return (
		<div className="status-indicator">
			<span
				className={`status-indicator__status ${
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
