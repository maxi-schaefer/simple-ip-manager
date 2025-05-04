import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import TitleBar from './components/TitleBar';
import './styles/index.css';
import IPProfileForm from './components/IPProfileForm';
import IPProfileCard from './components/IPProfileCard';

function Hello() {
  return (
    <>
      <TitleBar />
      <div className="container">
        <IPProfileForm />
        <IPProfileCard />
      </div>
    </>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Hello />} />
      </Routes>
    </Router>
  );
}
