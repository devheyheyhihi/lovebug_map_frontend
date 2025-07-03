import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { NavLink } from 'react-router-dom';

const SidebarContainer = styled.aside<{ isOpen: boolean }>`
  width: ${props => props.isOpen ? '250px' : '60px'};
  background-color: #34495e;
  color: white;
  transition: all 0.3s ease;
  overflow: hidden;
  
  @media (max-width: 768px) {
    position: fixed;
    top: 0;
    left: 0;
    height: 100vh;
    width: ${props => props.isOpen ? '80vw' : '60px'};
    max-width: 300px;
    transform: ${props => props.isOpen ? 'translateX(0)' : 'translateX(-100%)'};
    z-index: 1000;
    box-shadow: ${props => props.isOpen ? '2px 0 10px rgba(0, 0, 0, 0.3)' : 'none'};
  }
`;

const BackgroundOverlay = styled.div<{ isOpen: boolean }>`
  display: none;
  
  @media (max-width: 768px) {
    display: ${props => props.isOpen ? 'block' : 'none'};
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 999;
    opacity: ${props => props.isOpen ? 1 : 0};
    transition: opacity 0.3s ease;
  }
`;

const MobileMenuButton = styled.button<{ isOpen: boolean }>`
  display: none;
  
  @media (max-width: 768px) {
    display: ${props => props.isOpen ? 'none' : 'block'};
    position: fixed;
    top: 4rem;
    // left: 0.5rem;
    width: 50px;
    height: 50px;
    background-color: #34495e;
    border: none;
    border-radius: 8px;
    color: white;
    font-size: 1.5rem;
    cursor: pointer;
    z-index: 1001;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
    
    &:hover {
      background-color: #2c3e50;
    }
  }
`;

const ToggleButton = styled.button<{ isOpen: boolean }>`
  width: 100%;
  padding: 1rem;
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background-color: #2c3e50;
  }
  
  @media (max-width: 768px) {
    position: relative;
    justify-content: ${props => props.isOpen ? 'space-between' : 'center'};
    padding: ${props => props.isOpen ? '1rem' : '1rem 0.5rem'};
    
    &::after {
      content: ${props => props.isOpen ? "'✕'" : "''"};
      font-size: 1rem;
      opacity: ${props => props.isOpen ? 1 : 0};
      transition: opacity 0.3s ease;
    }
  }
`;

const NavList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const NavItem = styled.li`
  margin: 0;
`;

const StyledNavLink = styled(NavLink)`
  display: flex;
  align-items: center;
  padding: 1rem;
  color: white;
  text-decoration: none;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #2c3e50;
  }
  
  &.active {
    background-color: #e74c3c;
  }
`;

const Icon = styled.span`
  font-size: 1.2rem;
  margin-right: 1rem;
  min-width: 20px;
`;

const Label = styled.span<{ isOpen: boolean }>`
  opacity: ${props => props.isOpen ? 1 : 0};
  transition: opacity 0.3s ease;
  white-space: nowrap;
`;

const Sidebar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (!mobile) {
        setIsOpen(true);
      } else {
        setIsOpen(false);
      }
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const closeSidebar = () => {
    if (isMobile) {
      setIsOpen(false);
    }
  };

  const handleNavClick = () => {
    if (isMobile) {
      setIsOpen(false);
    }
  };

  const navItems = [
    { path: '/', icon: '🗺️', label: '실시간 맵' },
    { path: '/dashboard', icon: '📊', label: '대시보드' },
    { path: '/reports', icon: '📋', label: '신고 목록' },
    { path: '/statistics', icon: '📈', label: '통계' },
    { path: '/hotspots', icon: '🔥', label: '핫스팟' }
  ];

  return (
    <>
      <BackgroundOverlay isOpen={isOpen && isMobile} onClick={closeSidebar} />
      <MobileMenuButton isOpen={isOpen && isMobile} onClick={toggleSidebar}>
        ☰
      </MobileMenuButton>
      <SidebarContainer isOpen={isOpen}>
        <ToggleButton isOpen={isOpen} onClick={toggleSidebar}>
          {isMobile ? (isOpen ? '메뉴' : '☰') : (isOpen ? '◀' : '▶')}
        </ToggleButton>
        <NavList>
          {navItems.map((item) => (
            <NavItem key={item.path}>
              <StyledNavLink to={item.path} onClick={handleNavClick}>
                <Icon>{item.icon}</Icon>
                <Label isOpen={isOpen}>{item.label}</Label>
              </StyledNavLink>
            </NavItem>
          ))}
        </NavList>
      </SidebarContainer>
    </>
  );
};

export default Sidebar;