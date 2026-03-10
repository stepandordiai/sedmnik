export interface Icon {
	size?: number;
}

export interface Tool {
	_id: string;
	name: string;
	building: string;
	qty: number;
	status: string;
	desc: string;
}

export interface Building {
	id: string;
	name: string;
}
