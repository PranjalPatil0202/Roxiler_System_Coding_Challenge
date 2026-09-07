import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import ToastContainer from './ToastContainer';

const pageVariants = {
  initial: {
    opacity: 0,
    y: 12,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.24,
      ease: [0.16, 1, 0.3, 1], // Snappy modern cubic-bezier curve
    },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: {
      duration: 0.14,
      ease: 'easeIn',
    },
  },
};

const DashboardLayout = ({ children }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  // Automatically close mobile menu on route navigation
  React.useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  return (
    <div className="dashboard-layout-root">
      {/* Persistent, Collapsible Sidebar with Mobile Drawer support */}
      <Sidebar
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
        isMobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      {/* Main Content Area */}
      <div className={`dashboard-main-area ${isCollapsed ? 'is-collapsed' : ''}`}>
        <Topbar onMobileMenuToggle={() => setMobileOpen((prev) => !prev)} />
        <AnimatePresence mode="wait">
          <motion.main
            key={location.pathname}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="dashboard-page-container"
          >
            {children}
          </motion.main>
        </AnimatePresence>
      </div>

      <ToastContainer />
    </div>
  );
};

export default DashboardLayout;
