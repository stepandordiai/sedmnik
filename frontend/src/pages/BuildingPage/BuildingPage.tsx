import { useEffect, useState } from "react";
import "./BuildingPage.scss";
import { useParams } from "react-router-dom";
import classNames from "classnames";
import api from "../../axios";
import StatusIndicator from "../../components/StatusIndicator/StatusIndicator";

const emptyInput = () => ({
	// TODO: LEARN THIS
	id: crypto.randomUUID(),
	desc: "",
	orderOption: "",
	orderDate: "",
});

const BuildingPage = ({ buildings }) => {
	const { id } = useParams();
	const [error, setError] = useState(null);
	const [loading, setLoading] = useState(false);
	const [orderedItems, setOrderedItems] = useState([
		emptyInput(),
		emptyInput(),
		emptyInput(),
	]);
	const [buildingOption, setBuildingOption] = useState<string>("Materiály");

	const building = buildings.find((b) => b._id === id);

	const handleOrderedItems = (id, name, value) => {
		setOrderedItems((prev) =>
			prev.map((item) => (item.id === id ? { ...item, [name]: value } : item)),
		);
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

				// TODO: LEARN THIS
				const filled = [...updated];

				while (filled.length < 3) {
					filled.push(emptyInput());
				}

				setOrderedItems(filled);
			} catch (err) {
				setError(err.message);
			} finally {
				setLoading(false);
			}
		};

		fetchOrderedItemsData();
	}, [id]);

	const saveOrderedItemsData = async () => {
		setLoading(true);

		try {
			await api.put(
				`/api/building/${building._id}/ordered-items`,
				orderedItems,
			);

			// setOrderedItems(res.data.orderedItems);
		} catch (err) {
			setError(err.message);
		} finally {
			setLoading(false);
		}
	};

	const addEmptyInput = () =>
		setOrderedItems((prev) => [...prev, emptyInput()]);

	const handleBuildingOption = (option: string) => setBuildingOption(option);

	return (
		<main className="building-page">
			<div style={{ display: "flex", gap: 5 }}>
				<button
					onClick={() => handleBuildingOption("Materiály")}
					className={classNames("building-page__btn", {
						"building-page__btn--active": buildingOption == "Materiály",
					})}
				>
					Materiály
				</button>
				<button
					onClick={() => handleBuildingOption("Harmonogram")}
					className={classNames("building-page__btn", {
						"building-page__btn--active": buildingOption == "Harmonogram",
					})}
				>
					Harmonogram
				</button>
			</div>
			{buildingOption === "Materiály" ? (
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
							style={{ margin: "5px 5px 0 0" }}
							className="btn"
						>
							Pridat
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
											<input
												onBlur={saveOrderedItemsData}
												onChange={(e) =>
													handleOrderedItems(
														orderedItem.id,
														e.target.name,
														e.target.value,
													)
												}
												value={orderedItem.desc}
												name="desc"
												style={{ width: "100%" }}
												className="input"
												type="text"
											/>
										</td>
										<td>
											<select
												onBlur={saveOrderedItemsData}
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
												})}
												id=""
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
			) : (
				<></>
			)}
		</main>
	);
};

export default BuildingPage;
