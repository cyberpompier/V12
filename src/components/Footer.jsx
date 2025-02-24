import React from 'react';
import { NavLink } from 'react-router-dom';
import { FaHome, FaTruck, FaToolbox, FaCog } from 'react-icons/fa';

function Footer() {
  return (
    <footer className="footer">
      <nav className="footer-nav">
        <NavLink to="/" className="nav-item" activeClassName="active">
          <FaHome size={24} />
        </NavLink>
        <NavLink to="/firetruck" className="nav-item" activeClassName="active">
          <FaTruck size={24} />
        </NavLink>
        <NavLink to="/materiels" className="nav-item" activeClassName="active">
          <FaToolbox size={24} />
        </NavLink>
        <NavLink to="/settings" className="nav-item" activeClassName="active">
          <FaCog size={24} />
        </NavLink>
      </nav>
    </footer>
  );
}

export default Footer;
