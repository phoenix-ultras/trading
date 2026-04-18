import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

function AppLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-bg via-gray-900 to-dark-bg text-light-text">
      <Navbar />
      <main>
        <Outlet />
      </main>
    </div>
  );
}

export default AppLayout;
