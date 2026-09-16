import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { ActiveTab } from './types';
import { Header } from './components/common/Header';
import { BottomNavigation } from './components/common/BottomNavigation';
import { ToastContainer } from './components/common/ToastContainer';
import { StockView } from './components/views/StockView';
import { InstructorsView } from './components/views/InstructorsView';
import { ClassesView } from './components/views/ClassesView';
import { RequisitionsView } from './components/views/RequisitionsView';
import { DispatchHistoryView } from './components/views/DispatchHistoryView';
import { DirectDispatchModal } from './components/modals/DirectDispatchModal';
import { Wifi, Battery, Signal } from 'lucide-react';

const MainAppContent: React.FC = () => {
  const { classes, instructors } = useApp();

  const [activeTab, setActiveTab] = useState<ActiveTab>('estoque');
  const [isMobileFrame, setIsMobileFrame] = useState<boolean>(false);
  const [openCreateInstructorModal, setOpenCreateInstructorModal] = useState<boolean>(false);

  // Direct dispatch modal
  const [isDirectDispatchOpen, setIsDirectDispatchOpen] = useState(false);
  const [directClassId, setDirectClassId] = useState<string | undefined>(undefined);
  const [directInstructorId, setDirectInstructorId] = useState<string | undefined>(undefined);

  // Requisitions tab initial class/instructor
  const [preselectedReqClassId, setPreselectedReqClassId] = useState<string | undefined>(undefined);
  const [preselectedReqInstructorId, setPreselectedReqInstructorId] = useState<string | undefined>(undefined);

  const handleOpenDirectDispatch = (classId?: string, instructorId?: string) => {
    setDirectClassId(classId || classes[0]?.id);
    setDirectInstructorId(instructorId || instructors[0]?.id);
    setIsDirectDispatchOpen(true);
  };

  const handleStartRequisitionForClass = (classId: string, instructorId: string) => {
    setPreselectedReqClassId(classId);
    setPreselectedReqInstructorId(instructorId);
    setActiveTab('requisicoes');
  };

  return (
    <div className="min-h-screen bg-[#fbf8ff] text-[#002747] flex flex-col items-center">
      <ToastContainer />

      {/* Outer Shell Wrapper (allows switching between realistic mobile frame and full width) */}
      <div
        className={`w-full transition-all duration-300 ${
          isMobileFrame
            ? 'max-w-md my-4 sm:my-8 bg-[#fbf8ff] rounded-3xl shadow-2xl overflow-hidden border-8 border-[#002747]'
            : 'max-w-5xl min-h-screen bg-[#fbf8ff] flex flex-col'
        }`}
      >
        {/* Simulated Mobile Status Bar if frame active */}
        {isMobileFrame && (
          <div className="bg-[#002747] text-white px-5 py-2 flex items-center justify-between text-[11px] font-medium select-none border-b border-[#00192e]">
            <span className="font-semibold">09:41</span>
            <div className="flex items-center space-x-1.5 text-slate-200">
              <Signal className="w-3 h-3" />
              <Wifi className="w-3 h-3" />
              <Battery className="w-4 h-4" />
            </div>
          </div>
        )}

        {/* Application Header */}
        <Header
          isMobileFrame={isMobileFrame}
          setIsMobileFrame={setIsMobileFrame}
          onOpenRequisitions={() => setActiveTab('requisicoes')}
          onOpenInstructors={() => setActiveTab('instrutores')}
          onOpenCreateInstructor={() => {
            setActiveTab('instrutores');
            setOpenCreateInstructorModal(true);
          }}
        />

        {/* Main Content Area */}
        <main className="flex-1 p-3 sm:p-5 overflow-y-auto">
          {activeTab === 'estoque' && (
            <StockView onOpenDirectDispatch={() => handleOpenDirectDispatch()} />
          )}

          {activeTab === 'instrutores' && (
            <InstructorsView
              isOpenCreateModalInitially={openCreateInstructorModal}
              onCloseInitialModal={() => setOpenCreateInstructorModal(false)}
              onStartDirectDispatchForInstructor={(cId, iId) => handleOpenDirectDispatch(cId, iId)}
              onStartRequisitionForInstructor={(cId, iId) => handleStartRequisitionForClass(cId, iId)}
            />
          )}

          {activeTab === 'turmas' && (
            <ClassesView
              onStartRequisitionForClass={handleStartRequisitionForClass}
              onStartDirectDispatchForInstructor={(cId, iId) => handleOpenDirectDispatch(cId, iId)}
            />
          )}

          {activeTab === 'requisicoes' && (
            <RequisitionsView
              initialPreselectedClassId={preselectedReqClassId}
              initialPreselectedInstructorId={preselectedReqInstructorId}
              onOpenDirectDispatch={() => handleOpenDirectDispatch()}
            />
          )}

          {activeTab === 'historico' && <DispatchHistoryView />}
        </main>

        {/* Bottom Navigation */}
        <BottomNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>

      {/* Direct Dispatch Modal */}
      <DirectDispatchModal
        isOpen={isDirectDispatchOpen}
        onClose={() => setIsDirectDispatchOpen(false)}
        preselectedClassId={directClassId}
        preselectedInstructorId={directInstructorId}
      />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}
