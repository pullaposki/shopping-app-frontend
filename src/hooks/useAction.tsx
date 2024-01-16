import {useState,useEffect} from 'react';
import {AppState} from '../types/states';
import ShoppingItem from '../models/ShoppingItem';
import User from '../models/User';

interface UrlRequest {
	request:Request;
	action:string;
}

interface Token {
	token:string;
}

const useAction = () => {
	
	const [state,setState] = useState<AppState>({
		list:[],
		isLogged:false,
		token:"",
		loading:false,
		error:"",
		user:""
	})
	
	const [urlRequest,setUrlRequest] = useState<UrlRequest>({
		request:new Request("",{}),
		action:""
	})
	
	//STATE HELPERS
	
	const saveToStorage = (state:AppState) => {
		sessionStorage.setItem("state",JSON.stringify(state));
	}
	
	useEffect(() => {
		let temp = sessionStorage.getItem("state");
		if(temp) {
			let state:AppState = JSON.parse(temp);
			setState(state);
		}
	},[])
	
	const setLoading = (loading:boolean) => {
		setState((state) => {
			return {
				...state,
				loading:loading,
				error:""
			}
		})
	}
	
	const setError = (error:string) => {
		setState((state) => {
			let tempState = {
				...state,
				error:error
			}
			saveToStorage(tempState);
			return tempState;
		})
	}
	
	const setUser = (user:string) => {
		setState((state) => {
			let tempState = {
				...state,
				user:user
			}
			saveToStorage(tempState);
			return tempState;
		})
	}
	
	useEffect(() => {
		
		const fetchData = async () => {
			setLoading(true);
			const response = await fetch(urlRequest.request);
			setLoading(false);
			if(!response){
				console.log("Server sent no response!");
				return;
			}
			if(response.ok) {
				switch(urlRequest.action) {
					case "getlist":
						let temp = await response.json();
						let list:ShoppingItem[] = temp as ShoppingItem[];
						setState((state) => {
							let tempState = {
								...state,
								list:list
							}
							saveToStorage(tempState);
							return tempState;
						})
						return;
					case "additem":
					case "removeitem":
					case "edititem":
						getList(state.token);
						return;
					case "register":
						setError("Register success");
						return;
					case "login":
						let token = await response.json();
						let data = token as Token;
						setState((state) => {
							let tempState = {
								...state,
								isLogged:true,
								token:data.token
							}
							saveToStorage(tempState);
							return tempState;
						})
						getList(data.token);
						return;
					case "logout":
						let tempState = {
							list:[],
							token:"",
							error:"",
							isLogged:false,
							loading:false,
							user:""
						}
						saveToStorage(tempState);
						setState(tempState);
						return;
					default:
						return;
				
				}
			} else {
				if(response.status === 403) {
					let tempState = {
						list:[],
						token:"",
						isLogged:false,
						loading:false,
						error:"Your session has expired. Logging you out",
						user:""
					}
					saveToStorage(tempState);
					setState(tempState);
					return;
				}
				let errorMessage = "Server responded with a status "+response.status+" "+response.statusText;
				switch(urlRequest.action) {
					case "register":
						if(response.status === 409) {
							errorMessage = "Username already in use"
						}
						setError(errorMessage);
						return;
					case "login":
					case "getlist":
					case "additem":
					case "removeitem":
					case "edititem":
						setError(errorMessage);
						return;
					case "logout":
						let tempState = {
							list:[],
							isLogged:false,
							loading:false,
							token:"",
							error:"Server responded with an error. Logging you out.",
							user:""
						}
						saveToStorage(tempState);
						setState(tempState);
						return;
					default:
						return;
				}
			}
		}
		
		fetchData();
		
	},[urlRequest]);
	
	const getList = (token:string) => {
		setUrlRequest({
			request:new Request("/api/shopping",{
				method:"GET",
				headers:{"token":token}
			}),
			action:"getlist"
		})
	}
	
	const add = (item:ShoppingItem) => {
		setUrlRequest({
			request:new Request("/api/shopping",{
				method:"POST",
				headers:{
					"Content-Type":"application/json",
					"token":state.token
				},
				body:JSON.stringify(item)
			}),
			action:"additem"
		})
	}
	
	const remove = (id:string) => {
		setUrlRequest({
			request:new Request("/api/shopping/"+id,{
				method:"DELETE",
				headers:{
					"token":state.token
				}
			}),
			action:"removeitem"
		})
	}
	
	const edit = (item:ShoppingItem) => {
		setUrlRequest({
			request:new Request("/api/shopping/"+item._id,{
				method:"PUT",
				headers:{
					"Content-Type":"application/json",
					"token":state.token
				},
				body:JSON.stringify(item)
			}),
			action:"edititem"
		})
	}
	
	const register = (user:User) => {
		setUrlRequest({
			request:new Request("/register",{
				method:"POST",
				headers:{"Content-Type":"application/json"},
				body:JSON.stringify(user)
			}),
			action:"register"
		})
	}
	
	const login = (user:User) => {
		setUser(user.username);
		setUrlRequest({
			request:new Request("/login",{
				method:"POST",
				headers:{"Content-Type":"application/json"},
				body:JSON.stringify(user)
			}),
			action:"login"
		})
	}
	
	const logout = () => {
		setUrlRequest({
			request:new Request("/logout",{
				method:"POST",
				headers:{"Content-Type":"application/json",
							"token":state.token}
			}),
			action:"logout"
		})
	}
	return {state,getList,add,remove,edit,register,login,logout,setError}
}

export default useAction;