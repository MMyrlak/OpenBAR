import {Routes, Route, Outlet, NavLink, useNavigate } from 'react-router-dom'
import './App.css'
import Drink from './components/Drink'
import Home from './components/Home'
import { Box, Button } from "@chakra-ui/react"
import {
  MenuContent,
  MenuItem,
  MenuRoot,
  MenuTrigger,
} from "@/components/ui/menu"
import { VscMenu } from "react-icons/vsc";
import UserMe from './components/UserMe'
import History from './components/History'
import { useEffect, useState } from 'react'
import jwt from 'jsonwebtoken';

function App() {
  const navigate = useNavigate();
  const [role, setRole] = useState("");
  useEffect(()=> {
    const checkAuth = () => {
      
      // Sprawdzamy, czy token jest zapisany w localStorage
      const authToken = localStorage.getItem('authToken');
      
      if (!authToken) {
          // Jeśli nie ma tokenu, przekierowujemy użytkownika na stronę logowania
          navigate('/login');  // Zmiana ścieżki na stronę logowania
      } else {
        const decodedToken = jwt.decode(authToken);
        if(decodedToken && decodedToken.role){
          setRole(decodedToken.role);
        } else {
          navigate('/login');
        }
      }
   };
   checkAuth();
  }, [])
  
  return (
    <>
      <Box w="100vw" 
        p="3" color="white"
        textDecoration="none"
        textStyle="3xl"
        display="flex"
        flexDirection="row"
        justifyContent='space-between'
      >
        <NavLink to='/' end> 
          Main Page
        </NavLink >
        <MenuRoot>
          <MenuTrigger asChild>
          <Button variant="outline" color="white" padding="0" w='10%'>
            <VscMenu size={10} />
          </Button>
          </MenuTrigger>
          <MenuContent>
            <MenuItem asChild value="naruto">
              <NavLink to={'/me/' + id}> Me </NavLink >
            </MenuItem>
            <MenuItem asChild value="one-piece">
              <NavLink to={'/me/history' + id}> History </NavLink >
            </MenuItem>
          </MenuContent>
        </MenuRoot>          
      </Box>
      
      <Routes>
        <Route path='/' element={<Home />}/>
        <Route path='/drink/:id' element={<Drink />}/>
        <Route path='/me/:id' element={<UserMe />}/>
        <Route path='/me/history/:id' element={<History />}/>
      </Routes>
      <Outlet />
    </>
  )
}

export default App
