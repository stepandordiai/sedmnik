import { useState } from "react";
import StatusIndicator from "../StatusIndicator/StatusIndicator";
import AutoGrowTextArea from "../AutoGrowTextArea/AutoGrowTextArea";
import api from "../../axios";
import { useEffect } from "react";
import PlusIconSmall from "../../icons/PlusIconSmall";
import classNames from "classnames";
import "./OrderedAndPurchasedItems.scss";

// TODO: learn this
const emptyInput = () => ({
	id: crypto.randomUUID(),
	desc: "",
	orderOption: "",
	orderDate: "",
});

const purchasedItemsemptyInput = () => ({
	id: crypto.randomUUID(),
	desc: "",
	purchaseOption: "",
	purchaseDate: "",
});

const OrderedAndPurchasedItems = ({ id, building }) => {
	const [error, setError] = useState(null);
	const [loading, setLoading] = useState(false);
	const [orderedItems, setOrderedItems] = useState([
		emptyInput(),
		emptyInput(),
		emptyInput(),
	]);
	const [purchasedItems, setPurchasedItems] = useState([
		purchasedItemsemptyInput(),
		purchasedItemsemptyInput(),
		purchasedItemsemptyInput(),
	]);

	const handleOrderedItems = (id: string, name: string, value: string) => {
		if (name === "orderOption" && value === "Dodáno") {
			setOrderedItems((prevOrdered) => {
				const itemToMove = prevOrdered.find((item) => item.id === id);
				if (!itemToMove) return prevOrdered;

				// Remove from ordered list
				const updatedOrdered = prevOrdered.filter((item) => item.id !== id);

				// 🔥 SAVE ordered items immediately
				saveOrderedItemsData(updatedOrdered);

				setPurchasedItems((prevPurchased) => {
					if (prevPurchased.some((p) => p.desc === itemToMove.desc)) {
						return prevPurchased;
					}

					const updated = [
						...prevPurchased,
						{
							id: crypto.randomUUID(),
							desc: itemToMove.desc,
							purchaseOption: value,
							purchaseDate: itemToMove.orderDate || "",
						},
					];

					savePurchasedData(
						updated.map(({ desc, purchaseOption, purchaseDate }) => ({
							desc,
							purchaseOption,
							purchaseDate,
						})),
					);

					return updated;
				});

				return updatedOrdered;
			});
		} else {
			setOrderedItems((prev) =>
				prev.map((item) =>
					item.id === id ? { ...item, [name]: value } : item,
				),
			);
		}
	};

	const handlePurchasedItems = (id: string, name: string, value: string) => {
		if (name === "purchaseOption" && value !== "Dodáno") {
			setPurchasedItems((prevPurchased) => {
				const itemToMove = prevPurchased.find((item) => item.id === id);
				if (!itemToMove) return prevPurchased;

				// Remove from ordered list
				const updatedPurchased = prevPurchased.filter((item) => item.id !== id);

				// 🔥 SAVE ordered items immediately
				savePurchasedData(updatedPurchased);

				setOrderedItems((prevOrdered) => {
					if (prevOrdered.some((p) => p.desc === itemToMove.desc)) {
						return prevOrdered;
					}

					const updated = [
						...prevOrdered,
						{
							id: crypto.randomUUID(),
							desc: itemToMove.desc,
							orderOption: value,
							orderDate: itemToMove.purchaseDate || "",
						},
					];

					saveOrderedItemsData(
						updated.map(({ desc, orderOption, orderDate }) => ({
							desc,
							orderOption,
							orderDate,
						})),
					);

					return updated;
				});

				return updatedPurchased;
			});
		} else {
			setPurchasedItems((prev) =>
				prev.map((item) =>
					item.id === id ? { ...item, [name]: value } : item,
				),
			);
		}
	};

	useEffect(() => {
		const fetchOrderedItemsData = async () => {
			setLoading(true);
			setError(null);

			try {
				const res = await api.get(
					`/api/building/${building._id}/ordered-items`,
				);

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

		const fetchPurchasedItemsData = async () => {
			setError(null);
			setLoading(true);

			try {
				const res = await api.get(
					`/api/building/${building._id}/purchased-items`,
				);

				const updated = res.data.map((item) => ({
					id: crypto.randomUUID(),
					desc: item.desc,
					purchaseOption: item.purchaseOption,
					purchaseDate: item.purchaseDate,
				}));

				// TODO: learn this
				const filled = [...updated];

				while (filled.length < 3) {
					filled.push(purchasedItemsemptyInput());
				}

				setPurchasedItems(filled);
			} catch (err) {
				setError(err.response?.data.message);
			} finally {
				setLoading(false);
			}
		};

		fetchOrderedItemsData();
		fetchPurchasedItemsData();
	}, [id]);

	const saveOrderedItemsData = async (data) => {
		setLoading(true);
		setError(null);

		try {
			await api.put(`/api/building/${building._id}/ordered-items`, data);
		} catch (err) {
			setError(err.response?.data.message);
		} finally {
			setLoading(false);
		}
	};

	const savePurchasedData = async (data) => {
		setLoading(true);
		setError(null);

		try {
			const res = await api.put(
				`/api/building/${building._id}/purchased-items`,
				data,
			);

			const updated = res.data.purchasedItems.map((item) => ({
				id: crypto.randomUUID(),
				desc: item.desc,
				purchaseDate: item.purchaseDate,
				purchaseOption: item.purchaseOption || "",
			}));

			const filled = [...updated];

			while (filled.length < 3) {
				filled.push(purchasedItemsemptyInput());
			}

			setPurchasedItems(filled);
		} catch (err) {
			setError(err.response?.data.message);
		} finally {
			setLoading(false);
		}
	};

	const addEmptyInput = () =>
		setOrderedItems((prev) => [...prev, emptyInput()]);

	return (
		<>
			<section className="section-table">
				<div
					style={{
						display: "flex",
						justifyContent: "space-between",
						alignItems: "cnter",
					}}
				>
					<h2 style={{ margin: "5px 0 0 5px ", fontWeight: 600 }}>
						Objednané materiály
					</h2>
					<button
						onClick={addEmptyInput}
						style={{
							margin: "5px 5px 0 0",
							display: "flex",
							justifyContent: "center",
							alignItems: "center",
						}}
						className="btn"
					>
						<PlusIconSmall />
						<span>Přidat</span>
					</button>
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
						{orderedItems.map((orderedItem) => {
							return (
								<tr key={orderedItem.id}>
									<td>
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
											blur={() => saveOrderedItemsData(orderedItems)}
										/>
									</td>
									<td>
										<select
											onBlur={() => saveOrderedItemsData(orderedItems)}
											onChange={(e) =>
												handleOrderedItems(
													orderedItem.id,
													e.target.name,
													e.target.value,
												)
											}
											value={orderedItem.orderOption}
											name="orderOption"
											className={classNames("input", {
												"input--green":
													orderedItem.orderOption === "S dopravou",
												"input--orange":
													orderedItem.orderOption === "K výzvednutí",
												"input--red": orderedItem.orderOption === "Poptáno",
												"input--blue": orderedItem.orderOption === "Dodáno",
											})}
										>
											<option value="">Nezvoleno</option>
											<option className="input--green" value="S dopravou">
												S dopravou
											</option>
											<option className="input--orange" value="K výzvednutí">
												K výzvednutí
											</option>
											<option className="input--red" value="Poptáno">
												Poptáno
											</option>
											<option className="input--blue" value="Dodáno">
												Dodáno
											</option>
										</select>
									</td>
									<td>
										<input
											onBlur={() => saveOrderedItemsData(orderedItems)}
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
											className="input"
											type="date"
										/>
									</td>
								</tr>
							);
						})}
					</tbody>
				</table>
				<StatusIndicator error={error} loading={loading} />
			</section>
			<section className="section-table">
				<div
					style={{
						display: "flex",
						justifyContent: "space-between",
						alignItems: "cnter",
					}}
				>
					<h2 style={{ margin: "5px 0 0 5px ", fontWeight: 600 }}>
						Dodané materiály
					</h2>
				</div>
				<table>
					<thead>
						<tr>
							<th>Popis</th>
							<th></th>
							<th>Termín dodání</th>
						</tr>
					</thead>
					<tbody>
						{purchasedItems.map((purchasedItem) => {
							return (
								<tr key={purchasedItem.id}>
									<td>
										<AutoGrowTextArea
											value={purchasedItem.desc}
											handleChange={(e) =>
												handlePurchasedItems(
													purchasedItem.id,
													e.target.name,
													e.target.value,
												)
											}
											name="desc"
											blur={() => savePurchasedData(purchasedItems)}
										/>
									</td>
									<td>
										<select
											onBlur={() => savePurchasedData(purchasedItems)}
											onChange={(e) =>
												handlePurchasedItems(
													purchasedItem.id,
													e.target.name,
													e.target.value,
												)
											}
											value={purchasedItem.purchaseOption}
											name="purchaseOption"
											className={classNames("input", {
												"input--green":
													purchasedItem.purchaseOption === "S dopravou",
												"input--orange":
													purchasedItem.purchaseOption === "K výzvednutí",
												"input--red":
													purchasedItem.purchaseOption === "Poptáno",
												"input--blue":
													purchasedItem.purchaseOption === "Dodáno",
											})}
										>
											<option value="">Nezvoleno</option>
											<option className="input--green" value="S dopravou">
												S dopravou
											</option>
											<option className="input--orange" value="K výzvednutí">
												K výzvednutí
											</option>
											<option className="input--red" value="Poptáno">
												Poptáno
											</option>
											<option className="input--blue" value="Dodáno">
												Dodáno
											</option>
										</select>
									</td>
									<td>
										<input
											onBlur={() => savePurchasedData(purchasedItems)}
											onChange={(e) =>
												handlePurchasedItems(
													purchasedItem.id,
													e.target.name,
													e.target.value,
												)
											}
											value={purchasedItem.purchaseDate}
											name="purchaseDate"
											style={{ width: "100%" }}
											className="input"
											type="date"
										/>
									</td>
								</tr>
							);
						})}
					</tbody>
				</table>
				<StatusIndicator error={error} loading={loading} />
			</section>
		</>
	);
};

export default OrderedAndPurchasedItems;
