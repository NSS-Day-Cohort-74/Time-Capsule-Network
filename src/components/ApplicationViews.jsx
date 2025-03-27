import { useState } from 'react'
import { BrowserRouter, Route, Routes } from "react-router-dom"
import { Authorized } from "./Authorized"
import { Login } from "../pages/Login.jsx"
import Home from "../pages/Home"
import { CapsuleForm } from "./CapsuleForm.jsx"
import { CapsuleList } from "./CapsuleList.jsx"
import { Register } from '../pages/Register.jsx'
import { StoryBrancher } from './StoryBrancher.jsx'
import { PredictionVerifier } from './PredictionVerifier.jsx'
import { DiscussionThread } from './DiscussionThread.jsx'
import { PersonalTimeline } from './PersonalTimeline.jsx'


export const ApplicationViews = () => {
    const [capsulesState, setCapsulesState] = useState([])

    const fetchCapsulesFromAPI = async () => {
        const response = await fetch("http://localhost:8000/capsules",
            {
                headers: {
                    Authorization: `Token ${JSON.parse(localStorage.getItem("capsule_token")).token}`
                }
            })
        const capsules = await response.json()
        setCapsulesState(capsules)
    }

    return <BrowserRouter>
        <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route element={<Authorized />}>
                <Route path="/" element={<Home />} />
                <Route path="/allcapsules" element={<CapsuleList capsules={capsulesState} fetchCapsules={fetchCapsulesFromAPI} />} />
                <Route path="/capsule/edit/:capsuleId" element={ <CapsuleForm/> } />
                <Route path="/create" element={<CapsuleForm fetchCapsules={fetchCapsulesFromAPI} />} />
                <Route path="/mine" element={<CapsuleList capsules={capsulesState} fetchCapsules={fetchCapsulesFromAPI} />} />

                {/* New routes for the added features */}
                <Route path="/capsules/:capsuleId/story" element={<StoryBrancher />} />
                <Route path="/capsules/:capsuleId/predictions" element={<PredictionVerifier />} />
                <Route path="/capsules/:capsuleId/discussions" element={<DiscussionThread />} />
                <Route path="/timeline" element={<PersonalTimeline />} />

                <Route path="*" element={<Home />} />
            </Route>
        </Routes>
    </BrowserRouter>
}