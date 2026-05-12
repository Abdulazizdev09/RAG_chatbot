import { title } from "process"
import "./global.css"
import { ThemeProvider } from "./components/ThemeProvider"

export const metaData = {
    title: "F1GPT",
    description: "The place to go for all your Formula One questions!"
}

const RootLayout = ({ children }) => {
    return (
        <html lang="en" suppressHydrationWarning>
            <body>
                <ThemeProvider>
                    {children}
                </ThemeProvider>
            </body>
        </html>
    )
}

export default RootLayout