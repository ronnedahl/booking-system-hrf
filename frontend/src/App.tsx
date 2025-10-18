import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={
            <div className="flex items-center justify-center min-h-screen">
              <div className="text-center">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                  Kanban Bokningssystem
                </h1>
                <p className="text-gray-600">
                  Sprint 1 Complete! 🚀
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Backend API structure ✓ | Frontend setup ✓ | Tailwind CSS v4 ✓ | React Router ✓
                </p>
              </div>
            </div>
          } />
        </Routes>
      </div>
    </Router>
  )
}

export default App
