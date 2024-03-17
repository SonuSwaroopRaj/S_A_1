import AzureSentimentAnalysis from './SentimentAnalysis';
import Average from './average';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<AzureSentimentAnalysis/>}></Route>
          <Route path='/scores' element={<Average/>}></Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;