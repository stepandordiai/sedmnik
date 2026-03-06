import "./Filter.scss";

const Filter = ({ onChange }) => {
	return (
		<div
			style={{
				display: "flex",
				justifyContent: "center",
				alignItems: "center",
				gap: 5,
			}}
		>
			<label htmlFor="filter">Filter</label>
			<input
				onChange={onChange}
				className="input"
				id="filter"
				type="text"
				placeholder="Hledat materiály..."
			/>
		</div>
	);
};

export default Filter;
