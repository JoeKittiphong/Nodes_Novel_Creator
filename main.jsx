import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import PlotApp from './test.jsx'
import './index.css'

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <PlotApp />
    </StrictMode>,
)
