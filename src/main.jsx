import React from 'react'
import ReactDOM from 'react-dom/client'
import { ApplicationViews } from './components/ApplicationViews'
import { Theme } from "@radix-ui/themes";
import "@radix-ui/themes/styles.css";
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Theme accentColor="blue" grayColor="sand" radius="large" scaling="95%">
      <ApplicationViews />
    </Theme>
  </React.StrictMode>,
)
