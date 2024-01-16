import {useEffect} from 'react';
import useAction from './hooks/useAction';
import ShoppingForm from './components/ShoppingForm';
import ShoppingList from './components/ShoppingList';
import Navbar from './components/Navbar';
import LoginPage from './components/LoginPage';
import {Routes,Route,Navigate} from 'react-router-dom';

function App() {

	// get actions
	const action = useAction();
	
	let messageArea = <h4 style={{"height":50,"textAlign":"center"}}></h4>
	
	// renders different sub-components based on the current action state
	
	// By sending action states to child components, the parent component (App in this case) provides the children with the ability to interact with and update the context provided by the parent.
	// For example, in your code navigation bar component Navbar receives a logout function action.logout. When this function is invoked in the Navbar component, it will change the state in the App component causing a logout.
	// Similarly, other components like ShoppingList, ShoppingForm and LoginPage receive different actions that can be invoked to update the state inside the App function.
	if(action.state.loading) {
		messageArea = <h4 style={{"height":50,"textAlign":"center"}}>Loading ...</h4>
	}
	if(action.state.error) {
		messageArea = <h4 style={{"height":50,"textAlign":"center"}}>{action.state.error}</h4>
	}
	if(action.state.isLogged) {
	return (
		<>
			<Navbar logout={action.logout} isLogged={action.state.isLogged} user={action.state.user}/>
				{messageArea}
			<Routes>
				<Route path="/" element={<ShoppingList list={action.state.list} remove={action.remove} edit={action.edit}/>}/>
				<Route path="/form" element={<ShoppingForm add={action.add}/>}/>
				<Route path="*" element={<Navigate to="/"/>}/>
			</Routes>
		</>
	) 
	}else {
		return(
		<>
			<Navbar logout={action.logout} isLogged={action.state.isLogged} user={action.state.user}/>
				{messageArea}
			<Routes>
				<Route path="/" element={<LoginPage register={action.register} login={action.login} setError={action.setError}/>}/>
				<Route path="*" element={<Navigate to="/"/>}/>
			</Routes>
		</>	
		)
	}
}

export default App
