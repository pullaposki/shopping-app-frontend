import React,{useState} from 'react';
import ShoppingItem from '../models/ShoppingItem';

interface Props {
	add(item:ShoppingItem):void;
}

interface State {
	type:string;
	count:number;
	price:number;
}

const ShoppingForm = (props:Props) => {
	
	const [state,setState] = useState<State>({
		type:"",
		count:0,
		price:0
	})
	
	const onChange = (event:React.ChangeEvent<HTMLInputElement>) => {
		setState((state) => {
			return {
				...state,
				[event.target.name]:event.target.value
			}
		})
	}
	
	const onSubmit = (event:React.SyntheticEvent) => {
		event.preventDefault();
		if(state.type === "") {
			return;
		}
		let item = new ShoppingItem(state.type,state.count,state.price,"");
		props.add(item);
		setState({
			type:"",
			count:0,
			price:0
		})
	}
	return(
		<div style={{"width":"40%","backgroundColor":"lightblue","margin":"auto","textAlign":"center"}}>
			<form className="m-3" onSubmit={onSubmit}>
				<label className="form-label" htmlFor="type">Type</label>
				<input type="text"
						name="type"
						id="type"
						onChange={onChange}
						className="form-control"
						value={state.type}/>
				<label className="form-label" htmlFor="count">Count</label>
				<input type="number"
						name="count"
						id="count"
						onChange={onChange}
						className="form-control"
						value={state.count}/>
				<label className="form-label" htmlFor="price">Price</label>
				<input type="number"
						step="0.01"
						name="price"
						id="price"
						onChange={onChange}
						className="form-control"
						value={state.price}/>
				<input type="submit" className="btn btn-primary" value="Add"/>
			</form>
		</div>
	)
}
export default ShoppingForm;