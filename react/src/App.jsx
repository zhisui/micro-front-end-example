import './App.css'
import { Routes, Route } from 'react-router-dom'
import  Home  from '@/views/Home.jsx'
function App() {
    return (
        <>
            <Routes>
                <Route path="/" element={<Home />}></Route>
            </Routes>
        </>
    )
}

export default App
