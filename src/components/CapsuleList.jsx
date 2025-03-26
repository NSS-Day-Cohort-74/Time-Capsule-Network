import { useEffect, useState } from "react"
import { Button } from "@radix-ui/themes";
import "./Capsules.css"
import { useNavigate } from "react-router-dom";

export const CapsuleList = () => {
    const [capsules, updateCapsuleTypes] = useState([])
    const navigate = useNavigate()

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

    useEffect(() => {
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
                <div>
                    <Button onClick={async () => {
                        const response = await fetch(`http://localhost:8000/capsules/${capsule.id}`, {
                            method: "DELETE",
                            headers: {
                                "Authorization": `Token ${JSON.parse(localStorage.getItem("capsule_token")).token}`
                            }
                        })
                        if (!response.ok) throw new Error('Failed to delete capsule');
                        fetchCapsules()
                    }}>Delete</Button>

                    <Button color="purple"
                        onClick={() => {
                            navigate(`/capsule/edit/${capsule.id}`, {
                                state: capsule
                            })
                        }}
                    >Edit</Button>
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
