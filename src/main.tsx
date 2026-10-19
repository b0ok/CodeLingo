import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import './darkTheme.css';
import { applyTheme } from './utils/theme';

applyTheme();

createRoot(document.getElementById('root')!).render(<App />);
