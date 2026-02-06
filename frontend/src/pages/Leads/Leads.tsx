import { useEffect, useState } from "react";
import PersonIcon from "../../icons/PersonIcon";
import "./Leads.scss";
import axios from "axios";
import StatusIndicator from "../../components/StatusIndicator/StatusIndicator";

const emptyLeadRow = () => ({
	id: crypto.randomUUID(),
	name: "Stepan",
	tel: "722001016",
	address: "Pod Hroby Kolin",
	position: "IT",
	details: "Idk",
});

const Leads = () => {
	const [leads, setLeads] = useState([emptyLeadRow()]);
	const [error, setError] = useState(null);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		const getLeads = async () => {
			setLoading(true);
			setError(null);

			try {
				const res = await axios.get(
					`${import.meta.env.VITE_API_URL}/leads/all`,
				);

				setLeads(res.data);
			} catch (err) {
				setError(error.response?.data.message);
			} finally {
				setLoading(false);
			}
		};

		getLeads();
	}, []);

	return (
		<main className="main">
			<section className="section">
				<div className="container-title">
					<PersonIcon size={20} />
					<h2>Potenciální pracovníci</h2>
				</div>
				<table>
					<thead>
						<tr>
							<th>#</th>
							<th>Jmeno</th>
							<th>Telefon</th>
							<th>Adresa</th>
							<th>Pozice</th>
							<th>Poznamky</th>
						</tr>
					</thead>
					<tbody>
						{leads.map((lead, i) => {
							return (
								<tr>
									<td>{i + 1}</td>
									<td>{lead.name}</td>
									<td>{lead.tel}</td>
									<td>{lead.address}</td>
									<td>{lead.position}</td>
									<td>{lead.details}</td>
								</tr>
							);
						})}
					</tbody>
				</table>
				<StatusIndicator error={error} loading={loading} />
			</section>
		</main>
	);
};

export default Leads;
