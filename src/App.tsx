import {useEffect, useState} from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Blank from './pages/Blank';
import { apiEndpoint } from "./constantsGlob";
import UploadContentPage from './pages/UploadContentPage';
import './index.css';

function App() {
    const [apiToken, setApiToken] = useState('');

    useEffect(() => {
        if (window.Telegram && window.Telegram.WebApp) {
            console.log(`Requesting API token from ${apiEndpoint}/auth.twa`);

            fetch(`${apiEndpoint}/auth.twa`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    "twa_data": window.Telegram.WebApp.initData
                }),
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json();
                })
                .then(data => {
                    if (data["auth_v1_token"] === undefined) {
                        window.location.href = "/unauthorized";
                        return;
                    }
                    setApiToken(data["auth_v1_token"]);
                })
                .catch(error => {
                    console.error('There was a problem with your fetch operation:', error);
                });

            fetch(`${apiEndpoint}/account`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': apiToken,
                }
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json();
                })
                .then(data => {
                    console.log(data);
                })
                .catch(error => {
                    console.error('There was a problem with your fetch operation:', error);
                });
        } else {
            console.log("Telegram WebApp not found");
            window.location.href = "/unauthorized";
        }
    }, []);
    return (
        <div className="App">
            <Router>
                <Routes>
                    <Route path="/" element={<Blank />} />
                    <Route path="/uploadContent" element={<UploadContentPage />} />
                </Routes>
            </Router>
        </div>
    )
}

export default App;
