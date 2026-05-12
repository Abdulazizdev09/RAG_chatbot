const Bubble = ({ message }) => {
    const { content, role } = message
    return (
        <div className={`${role} bubble`}>
            <p>{content}</p>
        </div>
    )
}

export default Bubble;