import "./LoadingSpinner.scss";

const LoadingSpinner = ({ clr = "var(--accent-clr)" }) => {
	return (
		<span
			style={{ "--spinner-clr": clr } as React.CSSProperties}
			className="loading-spinner"
		></span>
	);
};

export default LoadingSpinner;
