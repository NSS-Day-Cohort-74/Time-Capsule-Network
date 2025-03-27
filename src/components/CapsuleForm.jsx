import { useEffect, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { APIProvider, Map,Marker} from '@vis.gl/react-google-maps'

export const CapsuleForm = () => {
    const initialCapsuleState = {
        opening_date: "", descriptions: "", title: "",
        status: 0, type: 0, location_x: 0, location_y: 0
    }
    const [capsule, updateCapsuleProps] = useState(initialCapsuleState)
    const [capsuleTypes, updateCapsuleTypes] = useState([])
    const [capsuleStatuses, updateCapsuleStatuses] = useState([])
    const navigate = useNavigate()
    const location = useLocation()

    useEffect(() => {
        if (location.state !== null) {
            updateCapsuleProps(location.state)
        }
    }, [location])


    useEffect(() => {
        const fetchCapsuleTypes = async () => {
            const response = await fetch("http://localhost:8000/capsuletypes", {
                method: "GET",
                headers: {
                    "Authorization": `Token ${JSON.parse(localStorage.getItem("capsule_token")).token}`
                }
            })
            if (!response.ok) throw new Error('Failed to fetch users')
            const data = await response.json()
            updateCapsuleTypes(data)
        }

        const fetchCapsuleStatuses = async () => {
            const response = await fetch("http://localhost:8000/capsulestatuses", {
                method: "GET",
                headers: {
                    "Authorization": `Token ${JSON.parse(localStorage.getItem("capsule_token")).token}`
                }
            })
            if (!response.ok) throw new Error('Failed to fetch users')
            const data = await response.json()
            updateCapsuleStatuses(data)
        }

        fetchCapsuleTypes()
        fetchCapsuleStatuses()
    }, [])

    const collectCapsule = async (evt) => {
        evt.preventDefault()

        if (location.state !== null) {
            // PUT operation
            await fetch(`http://localhost:8000/capsules/${capsule.id}`, {
                method: "PUT",
                headers: {
                    "Authorization": `Token ${JSON.parse(localStorage.getItem("capsule_token")).token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(capsule)
            })
        }
        else {
            await fetch("http://localhost:8000/capsules", {
                method: "POST",
                headers: {
                    "Authorization": `Token ${JSON.parse(localStorage.getItem("capsule_token")).token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(capsule)
            })
        }
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
                            value={capsule.title} className="form-control" />
                    </fieldset>
                    <fieldset className="mt-4">
                        <label htmlFor="capsule">Description:</label>
                        <textarea id="description" type="text"
                            value={capsule.descriptions}
                            onChange={e => {
                                const copy = { ...capsule }
                                copy.descriptions = e.target.value
                                updateCapsuleProps(copy)
                            }}
                        ></textarea>

                    </fieldset>
                    <fieldset className="mt-4">
                        <label htmlFor="type"> Type </label>
                        <br />
                        <select id="type" className="form-control"
                            value={capsule.type}
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
                            value={capsule.status}
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
                                copy.opening_date = e.target.value
                                updateCapsuleProps(copy)
                            }}
                            value={capsule.opening_date} className="form-control" />
                    </fieldset>

                    <h2>Click on the map below to specify the location of the capsule</h2>
                    <APIProvider apiKey={import.meta.env.VITE_REACT_GOOGLE_MAPS_API_KEY}>
                        <Map
                            onClick={ev => {
                                console.log("latitide = ", ev.detail.latLng.lat);
                                console.log("longitude = ", ev.detail.latLng.lng);

                                const copy = { ...capsule }
                                copy.location_x = parseFloat(ev.detail.latLng.lat)
                                copy.location_y = parseFloat(ev.detail.latLng.lng)
                                updateCapsuleProps(copy)
                              }}
                            style={{ width: '100vw', height: '100vh' }}
                            defaultCenter={{ lat: 35.83724852629752, lng: -86.20026278367558 }}
                            defaultZoom={3}
                            gestureHandling={'greedy'}
                            disableDefaultUI={true}
                        >
                            {
                                capsule.location_x !== 0 && capsule.location_y !== 0
                                ? <Marker position={{ lat: capsule.location_x, lng: capsule.location_y }} />
                                : <></>
                                }
                            }
                        </Map>

                    </APIProvider>

                    <fieldset>
                        <button type="submit"
                            onClick={collectCapsule}
                            className="button rounded-md bg-blue-700 text-blue-100 p-3 mt-4">
                            Create Capsule
                        </button>
                    </fieldset>
                </form>
            </section>
        </main>
    )
}