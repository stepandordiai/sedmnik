import { useParams } from "react-router-dom";
import { useState } from "react";
import classNames from "classnames";
import WorkSchedule from "../../components/WorkSchedule/WorkSchedule";
import OrderedAndPurchasedItems from "../../components/OrderedAndPurchasedItems/OrderedAndPurchasedItems";
import Comments from "../../components/Comments/Comments";
import Footer from "../../components/layout/Footer/Footer";
import "./BuildingPage.scss";

const BuildingPage = () => {
	const { id } = useParams();

	const [buildingOption, setBuildingOption] = useState<string>("Materiály");

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
						<OrderedAndPurchasedItems buildingId={id} />
						<Comments buildingId={id} />
					</>
				) : (
					<WorkSchedule buildingId={id} />
				)}
				<Footer />
			</main>
		</>
	);
};

export default BuildingPage;
