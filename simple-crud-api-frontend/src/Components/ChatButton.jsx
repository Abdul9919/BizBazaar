import React from 'react'
import { FaCommentDots } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'

const ChatButton = () => {
    const navigate = useNavigate()

    const navigateTo = () => {
        navigate('/chat')
    }
    return (
        <div className='fixed bottom-4 right-4'>
            <FaCommentDots
                className="flex ml-auto my-7 cursor-pointer hover:scale-110 transition-transform duration-300"
                size={50}
                color="blue"
                onClick={navigateTo}
            />

        </div>
    )
}

export default ChatButton