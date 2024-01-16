import ShoppingItem from '../models/ShoppingItem';

export interface AppState {
	list:ShoppingItem[];
	isLogged:boolean;
	token:string;
	loading:boolean;
	error:string;
	user:string;
}