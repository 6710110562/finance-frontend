import './App.css';
import axios from 'axios'
import LoginScreen from './LoginScreen';


axios.defaults.baseURL = process.env.REACT_APP_BASE_URL || "http://localhost:1337"

function App() {
  const handleLoginSuccess = () => { alert("Login Success!!!") }

  return (
    <div className="App">
      <header className="App-header">
        <LoginScreen onLoginSuccess={handleLoginSuccess} />
      </header>
    </div>
  );
}

export default App;
