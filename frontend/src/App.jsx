import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './auth.jsx';
import AppLayout from './components/AppLayout.jsx';
import Landing from './pages/Landing.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Home from './pages/Home.jsx';
import LostFoundHub from './pages/LostFoundHub.jsx';
import SkillHub from './pages/SkillHub.jsx';
import Items from './pages/Items.jsx';
import ReportItem from './pages/ReportItem.jsx';
import ItemDetail from './pages/ItemDetail.jsx';
import MyItems from './pages/MyItems.jsx';
import Skills from './pages/Skills.jsx';
import MySkills from './pages/MySkills.jsx';
import Requests from './pages/Requests.jsx';
import Profile from './pages/Profile.jsx';

function RequireAuth({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
}

function GuestOnly({ children }) {
  const { user } = useAuth();
  return user ? <Navigate to="/home" replace /> : children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<GuestOnly><Landing /></GuestOnly>} />
      <Route path="/login" element={<GuestOnly><Login /></GuestOnly>} />
      <Route path="/register" element={<GuestOnly><Register /></GuestOnly>} />

      <Route element={<RequireAuth><AppLayout /></RequireAuth>}>
        <Route path="/home" element={<Home />} />
        <Route path="/lost-found" element={<LostFoundHub />} />
        <Route path="/skill-exchange" element={<SkillHub />} />
        <Route path="/items" element={<Items />} />
        <Route path="/items/report" element={<ReportItem />} />
        <Route path="/items/mine" element={<MyItems />} />
        <Route path="/items/:id" element={<ItemDetail />} />
        <Route path="/skills" element={<Skills />} />
        <Route path="/skills/mine" element={<MySkills />} />
        <Route path="/requests" element={<Requests />} />
        <Route path="/students/:id" element={<Profile />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
