import React from 'react';
import { BillProvider, useBill } from './context/BillContext';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { UploadScreen } from './components/upload/UploadScreen';
import { ReviewScreen } from './components/review/ReviewScreen';
import { AssignmentScreen } from './components/assignment/AssignmentScreen';
import { ResultsScreen } from './components/results/ResultsScreen';

const AppContent: React.FC = () => {
  const { currentStep } = useBill();

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white">
      {/* Top App Bar & Stepper */}
      <Header />

      {/* Main Dynamic Screen */}
      <main className="flex-1">
        {currentStep === 1 && <UploadScreen />}
        {currentStep === 2 && <ReviewScreen />}
        {currentStep === 3 && <AssignmentScreen />}
        {currentStep === 5 && <ResultsScreen />}
      </main>

      {/* App Footer */}
      <Footer />
    </div>
  );
};

export function App() {
  return (
    <BillProvider>
      <AppContent />
    </BillProvider>
  );
}

export default App;
