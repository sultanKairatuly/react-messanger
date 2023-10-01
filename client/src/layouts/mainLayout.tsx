import Sidebar from '../components/Sidebar'
import ChatContent from '../components/ChatContent'
import '../styles/MainLayout.css'



function MainLayout(){
    return (
        <div className="main_layout">
            <Sidebar />
            <ChatContent />
        </div>
    )
}

export default MainLayout