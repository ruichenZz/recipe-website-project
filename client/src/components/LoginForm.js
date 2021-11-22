import React, {useState} from 'react';
import SignUp from './SignUpForm';
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";
import { Navigate } from "react-router-dom";
import axios from "axios";

class LoginForm extends React.Component{

    constructor(props){
        super(props);
        /// Setting up state
        this.state={
            username: "",
            password: "",
            redirect: null,

        };
        /// Setting up functions - set 'this' context to this class
        this.inputUsername=this.inputUsername.bind(this);
        this.inputPassword=this.inputPassword.bind(this);
        this.onSubmit = this.onSubmit.bind(this);

    }

    //input functions
    inputUsername(event){
        this.setState({
            username: event.target.value
        });
    }
    inputPassword(event){
        this.setState({
            password: event.target.value
        });
    }


      //submit the data
    onSubmit(event){
        event.preventDefault();
        const LoginData={
            username: this.state.username,
            password: this.state.password
        };
        if(LoginData.username===""|| LoginData.password==="" ){
            alert("Cannot be empty form!");
            return;
        }
    /* Tracy's original code
    axios
      .post("http://localhost:3000/users/login", LoginData)
      .then((res) => {
        // only remove if complete successfully
        let info = res.data.data;
        localStorage.setItem('userInfo', JSON.stringify(info))

        this.setState({ username: "", password: "" });
        this.setState({ redirect: "/Home" });
      })
      .catch((err) => {
        // if error, notify user
        this.setState({ name: "", password: "" });
        alert("Username and password do not match!");
      });
    */

    // Code modified by Jiayue for testing
    axios
      .post("/users/login", LoginData)
      .then((res) => {
        // only remove if complete successfully
        if (res.data) {
            let info = res.data;
            localStorage.setItem('userInfo', JSON.stringify(info));
        } else {
            alert('Username and password do not match');
        }
        console.log(res.data);
        this.setState({ username: "", password: "" });
        this.setState({ redirect: "/Home" });
      })
      .catch((err) => {
        // if error, notify user
        this.setState({ name: "", password: "" });
        alert("Error");
      });



    }
    render(){
        if(this.state.redirect){
            return <Navigate to={this.state.redirect}/>
        }
        return(
        <div className="SignInBox" >
        <form className="input_form" onSubmit={this.onSubmit}>
            <div className="form-inner">
                <h2>Log In</h2>
                
               
                <div className="form-group">
                    <label htmlFor="name">UserName:</label>
                    <input type="text" placeholder="Sam Lee" name="name" id="name" onChange={this.inputUsername} value={this.state.username} />
                </div>

                <div className="form-group">
                    <label htmlFor="password">Password:</label>
                    <input type="password" placeholder="123456" name="password" id="password" onChange={this.inputPassword} value={this.state.password} />
                </div>

                <input type="submit" value="LOGIN" onClick={()=> this.finishLogin()}/>
                
                
            </div>
            
        </form>
        </div>

            )
        }
        
    
    



}




export default LoginForm
