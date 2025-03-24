import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"


export const CapsuleForm = ({ fetchCapsules }) => {
    const initialCapsuleState = {
        openingDate: "", description: "", title: "",
        status: 0, type: 0, x: 0, y: 0
    }
    const [capsule, updateCapsuleProps] = useState(initialCapsuleState)
    const [capsuleTypes, updateCapsuleTypes] = useState([])
    const [capsuleStatuses, updateCapsuleStatuses] = useState([])
    const navigate = useNavigate()


    useEffect(() => {
        const fetchCapsuleTypes = async () => {
            const response = await fetch("http://localhost:8000/capsuletypes", {
                method: "GET",
                headers: {
                    "Authorization": `Token ${JSON.parse(localStorage.getItem("capsule_token")).token}`
                }
            })
            if (!response.ok) throw new Error('Failed to fetch users');
            const data = await response.json();
            updateCapsuleTypes(data)
        }

        const fetchCapsuleStatuses = async () => {
            const response = await fetch("http://localhost:8000/capsulestatuses", {
                method: "GET",
                headers: {
                    "Authorization": `Token ${JSON.parse(localStorage.getItem("capsule_token")).token}`
                }
            })
            if (!response.ok) throw new Error('Failed to fetch users');
            const data = await response.json();
            updateCapsuleStatuses(data)
        }

        fetchCapsuleTypes()
        fetchCapsuleStatuses()
    }, [])

    const collectCapsule = async (evt) => {
        evt.preventDefault()

        await fetch("http://localhost:8000/capsules", {
            method: "POST",
            headers: {
                "Authorization": `Token ${JSON.parse(localStorage.getItem("capsule_token")).token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(capsule)
        })

        await fetchCapsules()
        navigate("/allcapsules")
    }

    return (
        <main className="container--login">
            <section>
                <form className="form--login" onSubmit={() => { }}>
                    <h1 className="text-3xl">Collect a Capsule</h1>
                    <fieldset className="mt-4">
                        <label htmlFor="capsule">Title:</label>
                        <input id="capsule" type="text"
                            onChange={e => {
                                const copy = { ...capsule }
                                copy.title = e.target.value
                                updateCapsuleProps(copy)
                            }}
                            value={capsule.name} className="form-control" />
                    </fieldset>
                    <fieldset className="mt-4">
                        <label htmlFor="capsule">Description:</label>
                        <textarea id="description" type="text"
                            value={capsule.description}
                            onChange={e => {
                                const copy = { ...capsule }
                                copy.description = e.target.value
                                updateCapsuleProps(copy)
                            }}
                        ></textarea>

                    </fieldset>
                    <fieldset className="mt-4">
                        <label htmlFor="type"> Type </label>
                        <br />
                        <select id="type" className="form-control"
                            onChange={e => {
                                const copy = { ...capsule }
                                copy.type = parseInt(e.target.value)
                                updateCapsuleProps(copy)
                            }}>
                            <option value={0}>- Select a type -</option>
                            {
                                capsuleTypes.map(t => <option
                                    key={`type-${t.id}`}
                                    value={t.id}>{t.name}</option>)
                            }
                        </select>
                    </fieldset>
                    <fieldset className="mt-4">
                        <label htmlFor="type"> Current status </label>
                        <br />
                        <select id="type" className="form-control"
                            onChange={e => {
                                const copy = { ...capsule }
                                copy.status = parseInt(e.target.value)
                                updateCapsuleProps(copy)
                            }}>
                            <option value={0}>- Select a status -</option>
                            {
                                capsuleStatuses.map(t => <option
                                    key={`type-${t.id}`}
                                    value={t.id}>{t.name}</option>)
                            }
                        </select>
                    </fieldset>

                    <fieldset className="mt-4">
                        <label htmlFor="capsule">Date to be opened:</label>
                        <input id="capsuleData" type="date"
                            onChange={e => {
                                const copy = { ...capsule }
                                copy.openingDate = e.target.value
                                updateCapsuleProps(copy)
                            }}
                            value={capsule.openingDate} className="form-control" />
                    </fieldset>

                    <fieldset className="mt-4">
                        <label htmlFor="capsule">X Coordinate:</label>
                        <input id="capsuleData" type="number"
                            onChange={e => {
                                const copy = { ...capsule }
                                copy.x = parseFloat(e.target.value)
                                updateCapsuleProps(copy)
                            }}
                            value={capsule.x} className="form-control" />
                    </fieldset>

                    <fieldset className="mt-4">
                        <label htmlFor="capsule">Y Coordinate:</label>
                        <input id="capsuleData" type="number"
                            onChange={e => {
                                const copy = { ...capsule }
                                copy.y = parseFloat(e.target.value)
                                updateCapsuleProps(copy)
                            }}
                            value={capsule.y} className="form-control" />
                    </fieldset>


                    <fieldset>
                        <button type="submit"
                            onClick={collectCapsule}
                            className="button rounded-md bg-blue-700 text-blue-100 p-3 mt-4">
                            Collect Capsule
                        </button>
                    </fieldset>
                </form>
            </section>
        </main>
    )
}