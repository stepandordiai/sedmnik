import { useParams } from "react-router-dom";
import { useState } from "react";
import classNames from "classnames";
import WorkSchedule from "../../components/WorkSchedule/WorkSchedule";
import OrderedAndPurchasedItems from "../../components/OrderedAndPurchasedItems/OrderedAndPurchasedItems";
import Comments from "../../components/Comments/Comments";
import "./BuildingPage.scss";

const BuildingPage = ({ buildings }) => {
	const { id } = useParams();

	const [buildingOption, setBuildingOption] = useState<string>("Materiály");

	const building = buildings.find((b) => b._id === id);

	return (
		<>
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
						<OrderedAndPurchasedItems building={building} />
						<Comments building={building} />
					</>
				) : (
					<WorkSchedule building={building} />
				)}
			</main>
		</>
	);
};

export default BuildingPage;
