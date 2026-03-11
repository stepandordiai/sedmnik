export interface Icon {
	size?: number;
}

export interface Tool {
	_id: string;
	name: string;
	building: {
		name: string;
		qty: number;
	}[];
	qty: number;
	status: string;
	desc: string;
}

export interface Building {
	id: string;
	name: string;
}
