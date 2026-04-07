const BITRIX_WEBHOOK_URL =
	"https://b24-mzglfo.bitrix24.eu/rest/13/iebvepomtz5i3vai/";

export default async function pushLeadToBitrix(lead) {
	const params = new URLSearchParams({
		"FIELDS[NAME]": lead.name,
		"FIELDS[PHONE][0][VALUE]": lead.tel,
		"FIELDS[ADDRESS]": lead.address || "",
		"FIELDS[POST]": lead.position || "",
		"FIELDS[COMMENTS]": lead.details || "",
	});

	const res = await fetch(`${BITRIX_WEBHOOK_URL}/crm.lead.add.json?${params}`);
	const data = await res.json();

	if (data.error) throw new Error(data.error_description || data.error);
	return data.result; // Bitrix lead ID
}
