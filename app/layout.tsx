import { title } from "process"
import "./global.css"

export const metaData = {
    title: "F1GPT",
    description: "The place to go for all your Formula One questions!"
}

const RootLayout = ({ children }) => {
    return (
        <html lang="en" suppressHydrationWarning>
            <body>
                {children}
            </body>
        </html>
    )
}

export default RootLayout