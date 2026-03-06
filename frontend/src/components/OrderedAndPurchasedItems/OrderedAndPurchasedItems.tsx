import { useState } from "react";
import StatusIndicator from "../StatusIndicator/StatusIndicator";
import AutoGrowTextArea from "../AutoGrowTextArea/AutoGrowTextArea";
import api from "../../axios";
import { useEffect } from "react";
import PlusIconSmall from "../../icons/PlusIconSmall";
import classNames from "classnames";
import "./OrderedAndPurchasedItems.scss";
import Filter from "../Filter/Filter";

const emptyInput = () => ({
	id: crypto.randomUUID(),
	desc: "",
	orderOption: "",
	orderDate: "",
});

const ORDER_STATUS = [
	{
		id: 1,
		label: "Nezvoleno",
		className: "",
	},
	{
		id: 2,
		label: "S dopravou",
		className: "input--green",
	},
	{
		id: 3,
		label: "K výzvednutí",
		className: "input--orange",
	},
	{
		id: 4,
		label: "Poptáno",
		className: "input--red",
	},
	{
		id: 5,
		label: "Dodáno",
		className: "input--blue",
	},
];

const OrderedAndPurchasedItems = ({ buildingId }) => {
	const [error, setError] = useState(null);
	const [loading, setLoading] = useState(false);
	const [orderedItems, setOrderedItems] = useState([
		emptyInput(),
		emptyInput(),
		emptyInput(),
	]);

	const handleOrderedItems = (id: string, name: string, value: string) => {
		setOrderedItems((prev) =>
			prev.map((item) => (item.id === id ? { ...item, [name]: value } : item)),
		);
	};

	useEffect(() => {
		const fetchOrderedItemsData = async () => {
			setLoading(true);
			setError(null);

			try {
				const res = await api.get(`/api/buildings/${buildingId}/ordered-items`);

				const updated = res.data.map((item) => ({
					id: crypto.randomUUID(),
					desc: item.desc,
					orderOption: item.orderOption,
					orderDate: item.orderDate,
				}));

				// TODO: learn this
				const filled = [...updated];

				while (filled.length < 3) {
					filled.push(emptyInput());
				}

				setOrderedItems(filled);
			} catch (err) {
				setError(err.response?.data.message);
			} finally {
				setLoading(false);
			}
		};

		fetchOrderedItemsData();
	}, [buildingId]);

	const saveOrderedItemsData = async () => {
		setLoading(true);
		setError(null);

		try {
			const res = await api.put(
				`/api/buildings/${buildingId}/ordered-items`,
				orderedItems,
			);

			const updated = res.data.map((item) => ({
				id: crypto.randomUUID(),
				desc: item.desc,
				orderOption: item.orderOption,
				orderDate: item.orderDate,
			}));

			const filled = [...updated];

			while (filled.length < 3) {
				filled.push(emptyInput());
			}

			setOrderedItems(filled);
		} catch (err) {
			setError(err.response?.data.message);
		} finally {
			setLoading(false);
		}
	};

	const addEmptyInput = () =>
		setOrderedItems((prev) => [...prev, emptyInput()]);

	const [filter, setFilter] = useState("");

	return (
		<section className="section-table">
			<div
				style={{
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
					gap: 10,
					flexWrap: "wrap",
					margin: "5px 5px 0 5px",
				}}
			>
				<h2 style={{ fontWeight: 600 }}>Objednané a dodané materiály</h2>
				<Filter onChange={(e) => setFilter(e.target.value)} />
			</div>
			<table>
				<thead>
					<tr>
						<th>Popis</th>
						<th>Objednáno</th>
						<th>Termín dodání</th>
					</tr>
				</thead>
				<tbody>
					{orderedItems
						.filter((item) =>
							item.desc.toLowerCase().includes(filter.toLowerCase().trim()),
						)
						.map((orderedItem) => {
							return (
								<tr key={orderedItem.id}>
									<td style={{ width: "100%" }}>
										<AutoGrowTextArea
											value={orderedItem.desc}
											handleChange={(e) =>
												handleOrderedItems(
													orderedItem.id,
													e.target.name,
													e.target.value,
												)
											}
											name="desc"
											blur={saveOrderedItemsData}
											disable={loading}
										/>
									</td>
									<td>
										<select
											onChange={(e) => {
												handleOrderedItems(
													orderedItem.id,
													e.target.name,
													e.target.value,
												);
											}}
											value={orderedItem.orderOption}
											name="orderOption"
											className={classNames("input", {
												"input--green":
													orderedItem.orderOption === "S dopravou",
												"input--orange":
													orderedItem.orderOption === "K výzvednutí",
												"input--red": orderedItem.orderOption === "Poptáno",
												"input--blue": orderedItem.orderOption === "Dodáno",
												"select--disabled": loading,
											})}
											onBlur={saveOrderedItemsData}
										>
											{ORDER_STATUS.map((status) => {
												return (
													<option
														className={status.className}
														value={status.label}
													>
														{status.label}
													</option>
												);
											})}
										</select>
									</td>
									<td>
										<input
											onBlur={saveOrderedItemsData}
											onChange={(e) =>
												handleOrderedItems(
													orderedItem.id,
													e.target.name,
													e.target.value,
												)
											}
											value={orderedItem.orderDate}
											name="orderDate"
											style={{ width: "100%" }}
											className={classNames("input", {
												"input--disabled": loading,
											})}
											type="date"
											disabled={loading}
										/>
									</td>
								</tr>
							);
						})}
				</tbody>
			</table>
			<button
				onClick={addEmptyInput}
				style={{
					margin: "0 5px 0 0",
					display: "flex",
					justifyContent: "center",
					alignItems: "center",
					alignSelf: "flex-end",
				}}
				className="btn"
			>
				<PlusIconSmall />
				<span>Přidat</span>
			</button>
			<div style={{ margin: "0 0 5px 5px" }}>
				<StatusIndicator error={error} loading={loading} />
			</div>
		</section>
	);
};

export default OrderedAndPurchasedItems;
