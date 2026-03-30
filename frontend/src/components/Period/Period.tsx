import { useState } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { useRef } from "react";
import api from "../../axios";
import StatusIndicator from "../StatusIndicator/StatusIndicator";
import classNames from "classnames";
import timeToMinutes from "../../utils/timeToMinutes";
import { capitalizeDay, dateToDayName } from "../../utils/helpers";
import "./Period.scss";
import LoadingSpinner from "../LoadingSpinner/LoadingSpinner";

const Period = ({ allUsers, userId }) => {
	const [error, setError] = useState(null);
	const [loading, setLoading] = useState(false);
	const [isPdfLoading, setIsPdfLoading] = useState(false);
	const [dateRange, setDateRange] = useState({
		startDate: "",
		endDate: "",
	});
	const [data, setData] = useState([]);
	const [initPdf, setInitPdf] = useState(false);
	const [responsibilities, setResponsibilities] = useState(false);

	const pdfRef = useRef<HTMLDivElement>(null);

	const handleDateRange = (name: string, value: string) => {
		setDateRange((prev) => ({ ...prev, [name]: value }));
	};

	const currentUser = allUsers.find((user) => user._id === userId);

	const fetchDataRange = async () => {
		setError(null);

		if (dateRange.startDate === "" || dateRange.endDate === "") {
			setError(
				dateRange.startDate === "" && dateRange.endDate === ""
					? "Vyberte prosím datum od a do"
					: dateRange.startDate === ""
						? "Vyberte prosím datum od"
						: "Vyberte prosím datum do",
			);
			return;
		}

		setLoading(true);

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

	// PDF
	// TODO: LEARN THIS
	const exportPDF = async () => {
		if (!pdfRef.current) return;
		if (data.length < 1) {
			setError("Žádná data k dispozici");
			return;
		}

		setInitPdf(true);
		setIsPdfLoading(true);

		// 🔥 clone the content into a hidden fixed-size container
		const hidden = document.createElement("div");
		hidden.style.cssText = `
        position: fixed;
        top: -9999px;
        left: -9999px;
        width: 794px;
        overflow: visible;
        background: #ffffff;
        z-index: -1;
    `;

		const clone = pdfRef.current.cloneNode(true) as HTMLElement;
		clone.style.width = "794px";
		hidden.appendChild(clone);
		document.body.appendChild(hidden);

		await new Promise((resolve) => setTimeout(resolve, 1000)); // let it paint

		const pdf = new jsPDF("p", "mm", "a4");
		const pageWidth = pdf.internal.pageSize.getWidth();
		const pageHeight = pdf.internal.pageSize.getHeight();
		const margin = 5;
		const contentWidth = pageWidth - margin * 2;
		let yOffset = margin;
		const SCALE = 3;

		const blocks = clone.querySelectorAll(".pdf-avoid-break");

		for (let i = 0; i < blocks.length; i++) {
			const block = blocks[i] as HTMLElement;

			const canvas = await html2canvas(block, {
				scale: SCALE,
				useCORS: true,
				allowTaint: false,
				backgroundColor: "#ffffff",
				windowWidth: 794,
			});

			const imgData = canvas.toDataURL("image/png");
			const imgHeight = (canvas.height * contentWidth) / canvas.width;

			if (yOffset + imgHeight > pageHeight - margin) {
				pdf.addPage();
				yOffset = margin;
			}

			pdf.addImage(imgData, "PNG", margin, yOffset, contentWidth, imgHeight);
			yOffset += imgHeight + 1;
		}

		pdf.save(`${currentUser.name.replace(" ", "-").toLowerCase()}-export.pdf`);

		// 🔥 clean up — remove the hidden clone
		document.body.removeChild(hidden);
		setInitPdf(false);
		setIsPdfLoading(false);
	};

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
			<section className="section">
				<p style={{ fontSize: "1.5rem" }}>Období</p>

				<div style={{ display: "flex", alignItems: "center", gap: 5 }}>
					<label htmlFor="from">Od </label>
					<input
						className={classNames("input", {
							"input--disabled": loading,
						})}
						id="from"
						type="date"
						onChange={(e) => handleDateRange(e.target.name, e.target.value)}
						name="startDate"
						value={dateRange.startDate}
						disabled={loading}
					/>
					<label htmlFor="to"> Do </label>
					<input
						className={classNames("input", {
							"input--disabled": loading,
						})}
						id="to"
						onChange={(e) => handleDateRange(e.target.name, e.target.value)}
						name="endDate"
						type="date"
						value={dateRange.endDate}
						disabled={loading}
					/>
					<button className="btn" onClick={fetchDataRange}>
						Získat data
					</button>
				</div>
				<div
					style={{
						display: "flex",
						flexDirection: "column",
						gap: 5,
					}}
				>
					<p>Další nastavení</p>
					<div
						style={{
							display: "flex",
							alignItems: "center",
							gap: 5,
						}}
					>
						<button
							style={{ justifyContent: "flex-end", width: "max-content" }}
							className={classNames("switch-btn", {
								"switch-btn--active": responsibilities,
							})}
							onClick={() => setResponsibilities((prev) => !prev)}
						></button>
						<span style={{ fontWeight: 600 }}>Popis práce</span>
					</div>
				</div>
				<StatusIndicator error={error} loading={loading} />
			</section>
			<div
				style={{
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
				}}
			>
				<p style={{ fontSize: "18px" }}>Náhled PDF dokumentu</p>
				<button onClick={exportPDF} className="weekbar__pdf">
					{isPdfLoading ? <LoadingSpinner clr="red" /> : "Export PDF"}
				</button>
			</div>
			<section ref={pdfRef} id="pdf-content" className="section">
				<div
					className="pdf-avoid-break"
					style={{
						display: "flex",
						justifyContent: "space-between",
					}}
				>
					<div style={{ fontSize: "1.5rem" }}>
						<p>
							<span style={{ color: "var(--accent-clr)" }}>Sedmník</span> |
							Neresen
						</p>
						<p>{currentUser.name}</p>
					</div>
					<div
						style={{
							display: "flex",
							flexDirection: "column",
						}}
					>
						<span>Odpracováno za měsíc</span>
						<span style={{ textAlign: "center" }} className="input">
							{totalTime}
						</span>
					</div>
				</div>
				{data.length < 1 ? (
					<p
						style={{
							textAlign: "center",
							fontSize: "24px",
							fontWeight: 500,
							padding: "50px 0",
						}}
					>
						Vyberte období pro zobrazení data
					</p>
				) : (
					<div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
						{data.map((item, i) => {
							const totalDayShift = () => {
								if (item.startTime && item.endTime) {
									const start = timeToMinutes(item.startTime);
									const end = timeToMinutes(item.endTime);
									const over = timeToMinutes(item.overTime);
									const pause = timeToMinutes(item.pauseTime);

									const hours = Math.floor((end - start + over - pause) / 60);
									const minutes = (end - start + over - pause) % 60;

									return hours + ":" + minutes.toString().padStart(2, "0");
								} else {
									return "--:--";
								}
							};

							return (
								<div
									className="pdf-avoid-break"
									key={i}
									style={{
										display: "flex",
										flexDirection: "column",
										gap: 5,
										width: "100%",
										border: "var(--secondary-border)",
										padding: 10,
										borderRadius: 10,
									}}
								>
									<div
										style={{ display: "flex", justifyContent: "space-between" }}
									>
										<div>
											<span>Datum</span>
											<p style={{ width: "min-content" }} className="container">
												{capitalizeDay(dateToDayName(item.date))} | {item.date}
											</p>
										</div>
										<div style={{ display: "flex", marginTop: "auto", gap: 5 }}>
											<div>
												<p>Prichod</p>
												<p className="container">{item.startTime || "--:--"}</p>
											</div>
											<div>
												<p>Odchod</p>
												<p className="container">{item.endTime || "--:--"}</p>
											</div>
											<div>
												<p>Pauza</p>
												<p className="container">{item.pauseTime || "--:--"}</p>
											</div>
											<div className="visit-input-container">
												<span>Přesčas</span>
												<p className="container">{item.overTime || "--:--"}</p>
											</div>
											<div className="visit-input-container">
												<span>Odpracovano</span>
												<p className="container">{totalDayShift()}</p>
											</div>
										</div>
									</div>

									{responsibilities && (
										<>
											{item.responsibilities.length < 1 ? (
												<>
													<span>Popis prace</span>
													<div key={i} style={{ display: "flex", gap: 5 }}>
														<p
															style={{ width: "100%", flexGrow: 1 }}
															className="input"
														>
															Žádná data
														</p>
														<p
															style={{
																whiteSpace: "nowrap",
																width: "min-content",
															}}
															className="input"
														>
															--:--
														</p>
													</div>
												</>
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
																	style={{
																		whiteSpace: "nowrap",
																		width: "min-content",
																	}}
																	className="input"
																>
																	{responsibility.time || "--:--"}
																</p>
															</div>
														);
													})}
												</>
											)}
										</>
									)}
								</div>
							);
						})}
					</div>
				)}
			</section>
		</>
	);
};

export default Period;
