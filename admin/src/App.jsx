import React, { useContext } from 'react'
import { Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import Add from './pages/Add'
import Lists from './pages/Lists'
import Orders from './pages/Orders'
import Login from './pages/Login'
import { adminDataContext } from './context/AdminContext'
import { ToastContainer, toast } from 'react-toastify';
import Chatbot from './component/Chatbot'

function App() {
  let {adminData, loading} = useContext(adminDataContext)
  return (

    <>
      <ToastContainer />
    {loading ? <div className='w-[100vw] h-[100vh] flex items-center justify-center text-white'>Loading...</div> : !adminData ? <Login/> : <>

      <Routes>
        <Route path='/' element={<Home/>}/>
        <Route path='/add' element={<Add/>}/>
        <Route path='/lists' element={<Lists/>}/>
        <Route path='/orders' element={<Orders/>}/>
        <Route path='/login' element={<Login/>}/>
      </Routes>
      </>
      }
      {adminData && <Chatbot/>}
    </>
  )
}

export default App
