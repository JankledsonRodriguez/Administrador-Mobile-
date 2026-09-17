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

const MainAppContent: React.FC = () => {
  const { classes, instructors } = useApp();

  const [activeTab, setActiveTab] = useState<ActiveTab>('estoque');
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
    <div className="min-h-screen sigec-app-bg text-[#002747] flex flex-col items-center">
      <ToastContainer />

      {/* Main Container Wrapper - Optimized for Mobile View */}
      <div className="w-full min-h-screen flex flex-col overflow-x-hidden relative z-10">
        {/* Application Header */}
        <Header
          onOpenRequisitions={() => setActiveTab('requisicoes')}
          onOpenInstructors={() => setActiveTab('instrutores')}
          onOpenCreateInstructor={() => {
            setActiveTab('instrutores');
            setOpenCreateInstructorModal(true);
          }}
        />

        {/* Main Content Area */}
        <main className="flex-1 p-3 sm:p-5 overflow-y-auto pb-24">
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
