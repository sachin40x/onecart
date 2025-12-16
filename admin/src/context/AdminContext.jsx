import React, { createContext, useContext, useEffect, useState } from 'react'
import { authDataContext } from './AuthContext'
import axios from 'axios'

export const adminDataContext = createContext()
function AdminContext({children}) {
    let [adminData,setAdminData] = useState(null)
    const [loading, setLoading] = useState(true)
    let {serverUrl} = useContext(authDataContext)


    const getAdmin = async () => {
      setLoading(true)
      try {
           let result = await axios.get(serverUrl + "/api/user/getadmin",{withCredentials:true})

      setAdminData(result.data)
      console.log(result.data)
      setLoading(false)
      } catch (error) {
        setAdminData(null)
        console.log(error)
        setLoading(false)
      }
    }

    useEffect(()=>{
     getAdmin()
    },[])


    let value = {
adminData,setAdminData,getAdmin,loading
    }
  return (
    <div>
<adminDataContext.Provider value={value}>
    {children}
</adminDataContext.Provider>
      
    </div>
  )
}

export default AdminContext