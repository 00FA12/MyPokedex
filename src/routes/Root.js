import "../index.css"
import { Link, Outlet } from "react-router-dom"

export default function App() {
    return (
        <>
            <nav>
                <Link to="/" class="routing">Home</Link>
                <Link to="/about" class="routing">About</Link>
            </nav>
            <Outlet />
        </>
    )
}