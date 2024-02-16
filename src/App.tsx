import { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Blank from './pages/Blank';
import UploadContentPage from './pages/UploadContentPage';
import './index.css';

function App() {
    useEffect(() => {}, []);
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
