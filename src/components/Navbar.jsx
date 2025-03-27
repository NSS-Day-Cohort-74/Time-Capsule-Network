import { NavLink, useNavigate } from "react-router-dom"
import "./Navbar.css"

export const NavBar = () => {
    const navigate = useNavigate()
    return (
        <ul className="navbar pb-10 flex justify-between">
            <li className="navbar__item pl-10">
                <NavLink className="text-left underline text-blue-600 hover:text-purple-700" to={"/allcapsules"}>All Capsules</NavLink>
            </li>
            <li className="navbar__item">
                <NavLink className="text-left underline text-blue-600 hover:text-purple-700" to={"/create"}>Create a Capsule</NavLink>
            </li>
            <li className="navbar__item">
                <NavLink className="text-left underline text-blue-600 hover:text-purple-700" to={"/mine"}>My Capsule</NavLink>
            </li>
            <li className="navbar__item">
                <NavLink className="text-left underline text-blue-600 hover:text-purple-700" to={"/timeline"}>My Timeline</NavLink>
            </li>
            {
                (localStorage.getItem("capsule_token") !== null) ?
                    <li className="navbar__item">
                        <button className="underline text-blue-600 hover:text-purple-700"
                            onClick={() => {
                                localStorage.removeItem("capsule_token")
                                navigate('/login')
                            }}
                        >Logout</button>
                    </li> :
                    <>
                        <li className="navbar__item">
                            <NavLink className="text-left underline text-blue-600 hover:text-purple-700" to={"/login"}>Login</NavLink>
                        </li>
                        <li className="navbar__item">
                            <NavLink className="text-left underline text-blue-600 hover:text-purple-700" to={"/register"}>Register</NavLink>
                        </li>
                    </>
            }        </ul>
    )
}