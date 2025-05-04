import '../styles/TitleBar.css'
import icon from '../assets/icon.png';

export default function TitleBar() {
    return (
        <div id="header">
            <div className="topBar">

                <div className="titleBar">
                    <img src={icon} alt="Icon" />
                    <div className="title">Simple IP Manager</div>
                </div>

                <div className="titleBarButtons">
                    <button className='topButton minimizeButton' onClick={() => window.electron.ipcRenderer.sendMessage('minimize-app', [])}/>
                    <button className='topButton maximizeBtn' onClick={() => window.electron.ipcRenderer.sendMessage('maximize-app', [])} />
                    <button className='topButton closeBtn' onClick={() => window.electron.ipcRenderer.sendMessage('close-app', [])} />
                </div>

            </div>
        </div>
    )
}
