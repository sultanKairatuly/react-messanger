import { useState } from 'react';

function Signup(){
    const [login, setLogin] = useState("");
    const [password, setPassword] = useState("");
    const [repeatedPassword, setRepeatedPassword] = useState("");

    function handleLoginChange(e: React.ChangeEvent<HTMLInputElement>){
            setLogin(e.target.value)
    }

    function handlePasswordChange(e: React.ChangeEvent<HTMLInputElement>){
            setPassword(e.target.value);
    }

    function handleRepeatedPasswordChange(e: React.ChangeEvent<HTMLInputElement>){
            setRepeatedPassword(e.target.value);
    }

    return (
        <div className="signup_container" >
            <div className="signup_form">
                <label htmlFor="login">
                    <input className="input" value={login} onChange={handleLoginChange} />
                </label>
                <label htmlFor="password">
                    <input className="input" value={password} onChange={handlePasswordChange} />
                </label>
                <label htmlFor="repeated password">
                    <input className="input" value={repeatedPassword} onChange={handleRepeatedPasswordChange} />
                </label>                  
                <button className="singup_button">Sign up</button>
            </div>
        </div>
    )
}


export default Signup