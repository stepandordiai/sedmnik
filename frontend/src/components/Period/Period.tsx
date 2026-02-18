import dateToDayName from "../../utils/dateToDayName";
import { useState } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { useRef } from "react";
import api from "../../axios";
import "./Period.scss";
import StatusIndicator from "../StatusIndicator/StatusIndicator";
import classNames from "classnames";
import timeToMinutes from "../../utils/timeToMinutes";

const Period = ({ allUsers, userId }) => {
	const [error, setError] = useState(null);
	const [loading, setLoading] = useState(false);
	const [dateRange, setDateRange] = useState({
		startDate: "",
		endDate: "",
	});
	const [data, setData] = useState([]);
	const [initPdf, setInitPdf] = useState(false);

	const handleDateRange = (name, value) => {
		setDateRange((prev) => ({ ...prev, [name]: value }));
	};

	const currentUser = allUsers.find((user) => user._id === userId);

	const fetchDataRange = async () => {
		setLoading(true);
		setError(null);

		try {
			const res = await api.get(
				`/api/work/responsibilities/date-range/${userId}`,
				{
					params: {
						startDate: dateRange.startDate,
						endDate: dateRange.endDate,
					},
				},
			);

			// TODO: learn this
			const sorted = res.data.sort((a, b) => a.date.localeCompare(b.date));

			setData(sorted);
		} catch (err) {
			setError(err);
		} finally {
			setLoading(false);
		}
	};

	console.log(error);

	// PDF

	const pdfRef = useRef<HTMLDivElement>(null);

	// TODO: LEARN THIS
	const exportPDF = async () => {
		if (!pdfRef.current) return;
		document.body.classList.add("content-page");
		setInitPdf(true);

		await new Promise((resolve) => setTimeout(resolve, 200));

		const pdf = new jsPDF("p", "mm", "a4");

		const pageWidth = pdf.internal.pageSize.getWidth();
		const pageHeight = pdf.internal.pageSize.getHeight();

		const margin = 5;
		const contentWidth = pageWidth - margin * 2;
		let yOffset = margin;

		const blocks = pdfRef.current.querySelectorAll(".pdf-avoid-break");

		for (let i = 0; i < blocks.length; i++) {
			const block = blocks[i] as HTMLElement;

			const canvas = await html2canvas(block, {
				scale: 1,
				useCORS: true,
				allowTaint: false,
				backgroundColor: "#ffffff",
			});

			const imgData = canvas.toDataURL("image/jpeg");
			const imgHeight = (canvas.height * contentWidth) / canvas.width;

			// 🔥 NEW PAGE if block doesn't fit
			if (yOffset + imgHeight > pageHeight - margin) {
				pdf.addPage();
				yOffset = margin;
			}

			pdf.addImage(imgData, "JPEG", margin, yOffset, contentWidth, imgHeight);

			yOffset += imgHeight + 1; // spacing between blocks
		}

		pdf.save(`${currentUser.name.replace(" ", "-").toLowerCase()}-export.pdf`);

		document.body.classList.remove("content-page");
		setInitPdf(false);
	};

	// Helper arrow function
	const capitalizeDay = (day) => day?.charAt(0).toUpperCase() + day.slice(1);

	const totalMinutes = data.reduce((acc, item) => {
		if (!item.startTime || !item.endTime) {
			return acc;
		} else {
			return (
				acc +
				timeToMinutes(item.endTime) -
				timeToMinutes(item.startTime) -
				timeToMinutes(item.pauseTime)
			);
		}
	}, 0);

	const totalTime = `${Math.floor(totalMinutes / 60)
		.toString()
		.padStart(2, "0")}:${(totalMinutes % 60).toString().padStart(2, "0")}`;

	return (
		<>
			<button onClick={exportPDF} className="weekbar__pdf">
				Export PDF
			</button>
			<section ref={pdfRef} id="pdf-content" className="section">
				<div
					className={classNames("pdf-header pdf-avoid-break", {
						"pdf-header--visible": initPdf,
					})}
					style={{
						fontWeight: 600,
						fontSize: "1.5rem",
					}}
				>
					Neresen | <span style={{ color: "var(--accent-clr)" }}>Sedmník</span>
				</div>
				<div
					className="pdf-avoid-break"
					style={{
						display: "flex",
						flexDirection: "column",
						gap: 5,
						alignItems: "flex-start",
					}}
				>
					<p style={{ fontSize: "2rem" }}>{currentUser.name}</p>
					<p>Období</p>
					<div
						style={{
							display: "flex",
							justifyContent: "space-between",
							alignItems: "flex-end",
							width: "100%",
						}}
					>
						<div>
							<label htmlFor="from">Od </label>
							<input
								className="input"
								id="from"
								type="date"
								onChange={(e) => handleDateRange(e.target.name, e.target.value)}
								name="startDate"
								value={dateRange.startDate}
							/>
							<label htmlFor="to"> Do </label>
							<input
								className="input"
								id="to"
								onChange={(e) => handleDateRange(e.target.name, e.target.value)}
								name="endDate"
								type="date"
								value={dateRange.endDate}
							/>
						</div>
						<div style={{ display: "flex", flexDirection: "column" }}>
							<span>Odpracováno</span>
							<span style={{ textAlign: "center" }} className="input">
								{totalTime}
							</span>
						</div>
					</div>
					<button
						className={classNames("btn", {
							"pdf-btn--hidden": initPdf,
						})}
						onClick={fetchDataRange}
					>
						Získat data
					</button>
				</div>
				{data.length === 0 ? (
					"Vyberte období pro zobrazení data"
				) : (
					<div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
						{data.map((item, i) => {
							return (
								<div
									className="pdf-avoid-break"
									key={i}
									style={{
										display: "flex",
										flexDirection: "column",
										gap: 5,
										width: "100%",
										background: "var(--bg-clr)",
										padding: 10,
										borderRadius: 10,
									}}
								>
									<p
										style={{
											width: "max-content",
										}}
										className="input"
									>
										{capitalizeDay(dateToDayName(item.date))} | {item.date}
									</p>
									<div
										style={{
											display: "flex",
											flexDirection: "column",
											gap: 5,
											flexGrow: 1,
										}}
									>
										{item.responsibilities.length < 1 ? (
											<div key={i} style={{ display: "flex", gap: 5 }}>
												<p
													style={{ width: "100%", flexGrow: 1 }}
													className="input"
												>
													Žádná data
												</p>
												<p style={{ whiteSpace: "nowrap" }} className="input">
													--:--
												</p>
											</div>
										) : (
											<>
												{item.responsibilities.map((responsibility, i) => {
													return (
														<div key={i} style={{ display: "flex", gap: 5 }}>
															<p
																style={{ width: "100%", flexGrow: 1 }}
																className="input"
															>
																{responsibility.task}
															</p>
															<p
																style={{ whiteSpace: "nowrap" }}
																className="input"
															>
																{responsibility.time || "--:--"}
															</p>
														</div>
													);
												})}
											</>
										)}

										<div style={{ display: "flex", marginTop: "auto", gap: 5 }}>
											<div>
												<p>Prichod</p>
												<p className="input">{item.startTime || "--:--"}</p>
											</div>
											<div>
												<p>Odchod</p>
												<p className="input">{item.endTime || "--:--"}</p>
											</div>
											<div>
												<p>Pauza</p>
												<p className="input">{item.pauseTime || "--:--"}</p>
											</div>
										</div>
									</div>
								</div>
							);
						})}
					</div>
				)}
				<StatusIndicator error={error} loading={loading} />
			</section>
		</>
	);
};

export default Period;
