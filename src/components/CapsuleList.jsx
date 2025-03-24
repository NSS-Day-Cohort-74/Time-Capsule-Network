import { useEffect, useState } from "react"
import "./Capsules.css"

export const CapsuleList = () => {
    const [capsules, updateCapsuleTypes] = useState([])

    useEffect(() => {
        const fetchCapsules = async () => {
            const response = await fetch("http://localhost:8000/capsules", {
                method: "GET",
                headers: {
                    "Authorization": `Token ${JSON.parse(localStorage.getItem("capsule_token")).token}`
                }
            })
            if (!response.ok) throw new Error('Failed to fetch users');
            const data = await response.json();
            updateCapsuleTypes(data)
        }

        fetchCapsules()
    }, [])

    const displayCapsules = () => {
        if (capsules && capsules.length) {
            return capsules.map(capsule => <div class="capsule" key={`key-${capsule.id}`} >
                <div className="capsule__title">
                    {capsule.title}
                </div>
                <div className="capsule__description">
                    {capsule.descriptions}
                </div>
            </div>)
        }

        return <h3>Loading Capsules...</h3>
    }

    return (
        <>
            <h1 className="text-3xl">Capsule List</h1>

            <div className="capsules">
                {displayCapsules()}
            </div>
        </>
    )
}
