import Topbar from "@/components/Topbar"

const HomeLayout = ({children}: {children:React.ReactNode}) => {
  return (
   <>
   <Topbar/>
   {children}
   </>
  )
}

export default HomeLayout