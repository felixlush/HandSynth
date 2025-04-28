import React, { useEffect, useState, useRef } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from "./layout";
import Home from "./pages/home";



const App: React.FC = () => {
    return(
      <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout children={<Home />}/>}>
            </Route>
          </Routes>
      </BrowserRouter> 
    )
};

export default App;
