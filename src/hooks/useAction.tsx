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
	
	// AppState represents the essential state of your application
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
	
	//#region State Helpers
	// these functions are facilitating the state management of the application, by providing a way to update and persist the state of the application
	// sessionStorage object stores data for only one session
	const saveToStorage = (state:AppState) => {
		sessionStorage.setItem("state",JSON.stringify(state));
	}
	
	// pre-existing state saved to sessionStorage will be reloaded into the state of this component when it is loaded
	useEffect(() => {
		let temp = sessionStorage.getItem("state");		
		if(temp) {
			let state:AppState = JSON.parse(temp);
			setState(state);
		}
	},[])
	
	// set state's loading property
	const setLoading = (loading:boolean) => {
		setState((state) => {
			return {
				...state,
				loading:loading,
				error:""
			}
		})
	}
	
	// set state's error property
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
	
	// set state's user property
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
	//#endregion
	
	//#region State Machine
	// Triggers when url request state is changed
	
	// All the interactions with the state and storage are done using the setState and saveToStorage functions. 
	// Different parts of the state (isLogged, list, token, error, etc.) are set based on the urlRequest.action and the server's responses. 
	// The setState function updates the state with a function that accepts the previous state and returns the updated state. 
	// Then it saves this updated state to storage.
	useEffect(() => {
		
		const fetchData = async () => {
			setLoading(true);
			const response = await fetch(urlRequest.request);
			setLoading(false);
			if(!response){
				console.log("Server sent no response!");
				return;
			}
			
			// Handle action of request
			if(response.ok) {
				switch(urlRequest.action) {
					
					// If the action is 'getlist', it parses the response as JSON and cast it to a ShoppingItem[], updates the state with this list, and saves this state to storage.
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
						
					// calls getList() with the current state's token	
					case "additem":
					case "removeitem":
					case "edititem":
						getList(state.token);
						return;
						
						
					case "register":
						setError("Register success");
						return;
						
					// parses the response as a token, updates the state indicating the user is logged in and saves this state to storage. Then it retrieves the list
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
				
				// For responses that are not OK (response.ok == false), it checks for a 403 status and handles it by logging the user out. 
				// For other statuses, it sets an appropriate error message based on the response's status and status text, and the urlRequest.actio
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
	//#endregion
	
	//#region Action Triggers
	// set request and trigger corresponding action
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
	//#endregion
	
	return {state,getList,add,remove,edit,register,login,logout,setError}
}

export default useAction;