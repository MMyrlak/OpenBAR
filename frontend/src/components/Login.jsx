import axios from 'axios';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Login() {
    const navigate = useNavigate;
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    let message;
    const login = async (email, password) => {
        try {
          const response = await axios.post('http://localhost:5000/user/login', { email, password });
          switch(response.status) {
            case 200: {
                        localStorage.setItem('authToken', response.data.token);  // Zapisz token do localStorage
                        console.log("Zalogowano pomyślnie!");
                        navigate('/');
                        break;
                    }
            case 400:{
                        message = response.data.message;
                        break;
                    }
            
            case 500:{ 
                        message = response.data.message;
                        break;
                    }
            case 401:{ 
                        message = response.data.message;
                        break;
                    }        
            default:{
                        message = "Błąd";
                        break;
                    }
        }
        } catch (error) {
          console.error("Błąd logowania", error);
        }
      };
  return (
    <div>
        {message}
    </div>
  )
}

export default Login
