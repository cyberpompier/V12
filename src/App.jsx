import React, { useState, useEffect } from 'react';
    import { Routes, Route, useLocation } from 'react-router-dom';
    import Header from './components/Header';
    import Footer from './components/Footer';
    import Home from './pages/Home';
    import FireTruck from './pages/FireTruck';
    import Materiels from './pages/Materiels';
    import Settings from './pages/Settings';
    import Verification from './pages/Verification';

    function App() {
      const location = useLocation();
      const [scrollPositions, setScrollPositions] = useState({});

      useEffect(() => {
        const handleScroll = () => {
          setScrollPositions(prevPositions => ({
            ...prevPositions,
            [location.pathname]: window.scrollY
          }));
        };

        window.addEventListener('scroll', handleScroll);

        return () => {
          window.removeEventListener('scroll', handleScroll);
        };
      }, [location.pathname]);

      useEffect(() => {
        if (scrollPositions[location.pathname]) {
          window.scrollTo(0, scrollPositions[location.pathname]);
        }
      }, [location.pathname, scrollPositions]);

      const getPageTitle = () => {
        if (location.pathname.startsWith('/verification')) {
          const truckName = location.pathname.split('/').pop();
          return `Verification - ${truckName}`;
        }

        switch (location.pathname) {
          case '/':
            return 'Home';
          case '/firetruck':
            return 'Remise';
          case '/materiels':
            return 'Materiels';
          case '/settings':
            return 'Parametrage';
          default:
            return 'My PWA App';
        }
      };

      return (
        <div className="app-container">
          <Header title={getPageTitle()} />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/firetruck" element={<FireTruck />} />
            <Route path="/materiels" element={<Materiels />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/verification/:truckId" element={<Verification />} />
          </Routes>
          <Footer />
        </div>
      );
    }

    export default App;
