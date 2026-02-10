
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Measurement, AppState, SensorData } from './types';
import { SensorService } from './services/sensorService';
import { getATRAnalysis } from './services/geminiService';
import ScoliometerGauge from './components/ScoliometerGauge';
import InstructionsModal from './components/InstructionsModal';
import html2canvas from 'html2canvas';

type OrientationMode = 'portrait' | 'landscape';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [currentAngle, setCurrentAngle] = useState(0);
  const [calibrationOffset, setCalibrationOffset] = useState(0);
  const [showInstructions, setShowInstructions] = useState(false);
  const [orientation, setOrientation] = useState<OrientationMode>('landscape');
  const [analysis, setAnalysis] = useState<any | null>(null);
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);
  const [sensorWorking, setSensorWorking] = useState(false);

  const rawAngleRef = useRef(0);
  const captureAreaRef = useRef<HTMLDivElement>(null);

  const SWU_LOGO_URL = "https://wsrv.nl/?url=https://assets.mytcas.com/i/logo/009.png";
  const SPINE_ILLUSTRATION_URL = "https://cdn-icons-png.freepik.com/512/7994/7994879.png";

  const handleOrientation = useCallback((event: DeviceOrientationEvent) => {
    const { beta, gamma } = event;
    if (beta !== null || gamma !== null) {
      setSensorWorking(true);
      const rawAngle = SensorService.calculateATR(beta, gamma, orientation);
      rawAngleRef.current = rawAngle;
      
      if (appState === AppState.MEASURING) {
        setCurrentAngle(rawAngle - calibrationOffset);
      }
    }
  }, [appState, orientation, calibrationOffset]);

  const handleMotion = useCallback((event: DeviceMotionEvent) => {
    const acc = event.accelerationIncludingGravity;
    if (acc) {
      setSensorWorking(true);
      if (appState === AppState.MEASURING) {
        const rawAngle = SensorService.calculateFromGravity(
          acc.x || 0,
          acc.y || 0,
          acc.z || 0,
          orientation
        );
        rawAngleRef.current = rawAngle;
        setCurrentAngle(rawAngle - calibrationOffset);
      }
    }
  }, [appState, orientation, calibrationOffset]);

  useEffect(() => {
    const checkOrientation = () => {
      setOrientation(window.innerWidth > window.innerHeight ? 'landscape' : 'portrait');
    };
    window.addEventListener('resize', checkOrientation);
    checkOrientation();
    return () => window.removeEventListener('resize', checkOrientation);
  }, []);

  useEffect(() => {
    if (appState === AppState.MEASURING) {
      window.addEventListener('deviceorientation', handleOrientation);
      window.addEventListener('devicemotion', handleMotion);
    }
    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
      window.removeEventListener('devicemotion', handleMotion);
    };
  }, [appState, handleOrientation, handleMotion]);

  const startSensors = async () => {
    const granted = await SensorService.requestPermission();
    if (granted) {
      setAppState(AppState.MEASURING);
    } else {
      alert('ไม่สามารถเข้าถึงเซนเซอร์ได้');
    }
  };

  const handleCalibrate = () => {
    setCalibrationOffset(rawAngleRef.current);
    setCurrentAngle(0);
  };

  const lockAndAnalyze = async () => {
    const angleValue = currentAngle;
    setIsLoadingAnalysis(true);
    setAppState(AppState.RESULTS);
    
    try {
      const result = await getATRAnalysis(angleValue);
      setAnalysis(result);
    } catch (e) {
      setAnalysis({ summary: "การเชื่อมต่อขัดข้อง" });
    } finally {
      setIsLoadingAnalysis(false);
    }
  };

  const saveAsImage = async () => {
    if (captureAreaRef.current) {
      try {
        await document.fonts.ready;
        const targetElement = captureAreaRef.current;
        
        const canvas = await html2canvas(targetElement, {
          scale: 4, 
          backgroundColor: '#fffafa',
          useCORS: true,
          allowTaint: true,
          logging: false,
          onclone: (clonedDoc) => {
            const captureArea = clonedDoc.getElementById('capture-area');
            if (captureArea) {
              captureArea.style.width = '900px';
              captureArea.style.height = 'auto';
              captureArea.style.padding = '20px';
              captureArea.style.overflow = 'visible';
              
              // Remove "Bubble" effect from Left/Right Rotation Result Badge
              const resultBadges = clonedDoc.querySelectorAll('.bg-rose-50.rounded-\\[2rem\\]');
              resultBadges.forEach((node: any) => {
                node.style.background = 'none';
                node.style.border = 'none';
                node.style.boxShadow = 'none';
                node.style.padding = '0';
                node.style.textAlign = 'center';
                const p = node.querySelector('p');
                if (p) {
                  p.style.color = '#e11d48'; // rose-600 for visibility
                  p.style.fontSize = '12px';
                }
              });

              // Remove "Bubble" effect from Interpretation Status Badge
              const statusBadges = clonedDoc.querySelectorAll('.bg-slate-900.text-white');
              statusBadges.forEach((node: any) => {
                node.style.background = 'none';
                node.style.color = '#0f172a'; // text-slate-900
                node.style.padding = '0';
                node.style.border = 'none';
                node.style.fontSize = '10px';
                node.style.fontWeight = '900';
              });

              // Ensure general alignment for other containers
              const badges = clonedDoc.querySelectorAll('.rounded-\\[2rem\\], .rounded-\\[1rem\\]');
              badges.forEach((node: any) => {
                node.style.display = 'flex';
                node.style.alignItems = 'center';
                node.style.justifyContent = 'center';
                node.style.marginLeft = 'auto';
                node.style.marginRight = 'auto';
              });

              const resultCard = clonedDoc.querySelector('.bg-white.rounded-xl.p-3.sm\\:p-4.shadow-sm');
              if (resultCard) {
                (resultCard as HTMLElement).style.minWidth = '240px';
              }

              const textBlocks = clonedDoc.querySelectorAll('p, span, h1, h2, h3, h4');
              textBlocks.forEach((t: any) => {
                t.style.wordBreak = 'normal';
                t.style.overflowWrap = 'break-word';
              });
            }
          }
        });

        const link = document.createElement('a');
        link.download = `Scoliometer-Result-${new Date().getTime()}.png`;
        link.href = canvas.toDataURL('image/png', 1.0);
        link.click();
      } catch (err) {
        console.error("Capture failed", err);
        alert("ไม่สามารถบันทึกภาพได้ในขณะนี้");
      }
    }
  };

  const resetMeasurement = () => {
    setAnalysis(null);
    setAppState(AppState.MEASURING);
  };

  const Header = () => (
    <header className="bg-white px-3 py-1 border-b border-rose-100 shrink-0 z-30 shadow-sm">
      <div className="flex justify-between items-center max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <div className="h-6 sm:h-8 w-auto flex items-center">
             <img src={SWU_LOGO_URL} className="h-full object-contain" alt="Logo" />
          </div>
          <div className="flex flex-col justify-center border-l-2 border-slate-100 pl-2 py-0">
            <h1 className="text-[8px] sm:text-[10px] font-bold text-rose-800 leading-tight">รายวิชา กภ 421 คณะกายภาพบำบัด มศว</h1>
            <p className="text-[7px] sm:text-[9px] font-medium text-slate-500 leading-tight italic">โดย อ.ดร.ธันยา หมัดสะและ</p>
          </div>
        </div>
        <button 
          onClick={() => setShowInstructions(true)} 
          className="flex items-center gap-1 px-2 py-0.5 bg-rose-50 text-rose-700 rounded-lg hover:bg-rose-100 transition-all border border-rose-100 shrink-0"
        >
          <span className="text-[8px] font-black uppercase tracking-wider">วิธีใช้</span>
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        </button>
      </div>
    </header>
  );

  const Disclaimer = () => (
    <div className="px-3 py-1 bg-slate-50 rounded-lg border border-slate-200 w-full max-w-lg mx-auto shrink-0">
      <p className="text-[7px] sm:text-[8px] text-slate-500 text-center leading-tight">
        <span className="font-bold block text-slate-600 uppercase tracking-widest text-[7px] sm:text-[8px]">Disclaimer</span>
        แอปพลิเคชั่นนี้สำหรับใช้ประกอบการเรียนรู้รายวิชา กภ 421 เพื่อให้ได้ข้อมูลโดยสังเขป <br />
        ยังไม่ได้ทดสอบความแม่นยำและความเที่ยงทางคลินิก
      </p>
    </div>
  );

  return (
    <div className="h-[100dvh] w-full bg-[#fffafa] text-slate-900 flex flex-col font-['Anuphan'] overflow-hidden">
      {/* Forced Landscape Overlay */}
      <div className="fixed inset-0 z-[100] bg-rose-900 flex flex-col items-center justify-center p-8 text-center text-white sm:hidden portrait-only">
        <div className="w-16 h-16 mb-4 border-4 border-white rounded-2xl animate-bounce flex items-center justify-center">
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v16a2 2 0 002 2h12a2 2 0 002-2V4a2 2 0 00-2-2H6a2 2 0 00-2 2z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 21h8" /></svg>
        </div>
        <h2 className="text-lg font-black mb-1 uppercase tracking-widest">กรุณาหมุนโทรศัพท์</h2>
        <p className="text-xs font-medium opacity-80 leading-relaxed">กรุณาใช้งานในแนวนอนเพื่อความแม่นยำ</p>
      </div>

      <div ref={appState === AppState.RESULTS ? captureAreaRef : null} id="capture-area" className="flex-1 flex flex-col overflow-hidden bg-[#fffafa]">
        <Header />

        <main className="flex-1 flex flex-col w-full max-w-7xl mx-auto overflow-hidden relative">
          {appState === AppState.IDLE && (
            <div className="flex-1 flex flex-col items-center justify-center p-4 text-center overflow-y-auto">
              <div className="w-16 h-16 sm:w-24 sm:h-24 mb-3 p-3 bg-white rounded-[1.5rem] shadow-lg pink-glow flex items-center justify-center border-2 border-rose-50 shrink-0">
                <img src={SPINE_ILLUSTRATION_URL} className="w-full h-full object-contain" alt="Spine Icon" />
              </div>
              <h2 className="text-base sm:text-lg font-black text-slate-800 mb-0.5">Digital Scoliometer</h2>
              <p className="text-[9px] sm:text-xs text-slate-400 mb-4">เครื่องมือคัดกรองภาวะกระดูกสันหลังคดเบื้องต้น</p>
              <button onClick={startSensors} className="w-full max-w-xs py-2.5 bg-rose-600 text-white font-black rounded-xl shadow-lg active:scale-95 transition-all text-xs uppercase tracking-widest shrink-0">
                เริ่มใช้งาน
              </button>
              <div className="mt-4 px-4 w-full shrink-0">
                 <Disclaimer />
              </div>
            </div>
          )}

          {appState === AppState.MEASURING && (
            <div className="flex-1 flex flex-col h-full w-full overflow-hidden">
              <div className="flex-1 flex flex-col items-center justify-center py-1 min-h-0">
                 <div className="flex items-baseline gap-1 animate-in zoom-in duration-300">
                    <span className="text-6xl sm:text-8xl font-black tabular-nums tracking-tighter text-slate-900 leading-none">
                      {Math.abs(currentAngle).toFixed(1)}
                    </span>
                    <span className="text-xl sm:text-3xl font-bold text-rose-500">°</span>
                 </div>
                 <p className="text-[10px] sm:text-xs font-black text-rose-600 uppercase tracking-[0.2em] mt-0.5">
                   {currentAngle < -0.5 ? 'Left Rotation' : currentAngle > 0.5 ? 'Right Rotation' : 'Neutral'}
                 </p>
              </div>

              <div className="px-4 py-2 flex flex-col gap-2 items-center w-full shrink-0">
                 <div className="w-full max-w-md flex justify-between items-center bg-white/50 backdrop-blur-sm px-3 py-1 rounded-lg border border-rose-100">
                    <div className="flex items-center gap-2">
                       <div className={`w-1.5 h-1.5 rounded-full ${sensorWorking ? 'bg-green-500 shadow-sm' : 'bg-rose-500 animate-pulse'}`}></div>
                       <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{sensorWorking ? 'Active' : 'Wait'}</span>
                    </div>
                    <button onClick={handleCalibrate} className="px-2 py-0.5 bg-white border border-rose-100 rounded-md text-[8px] font-black text-rose-600 uppercase shadow-sm active:scale-95 transition-all">
                      Set Zero
                    </button>
                 </div>
                 
                 <button onClick={lockAndAnalyze} className="w-full max-w-md py-3 bg-rose-600 text-white font-black rounded-xl shadow-xl pink-glow text-base active:scale-95 transition-all uppercase tracking-[0.2em] border-2 border-white">
                   LOCK บันทึกค่า
                 </button>
              </div>

              <div className="w-full shrink-0">
                <ScoliometerGauge angle={currentAngle} isLocked={false} />
              </div>
            </div>
          )}

          {appState === AppState.RESULTS && (
            <div className="flex-1 flex flex-col p-2 overflow-hidden bg-[#fffafa]">
              <div className="flex-1 flex flex-col bg-[#fffafa] rounded-xl p-2 overflow-hidden min-h-0">
                <div className="flex flex-col sm:flex-row gap-2 flex-1 overflow-hidden min-h-0">
                  {/* ATR Result Card */}
                  <div className="bg-white rounded-xl p-3 sm:p-4 shadow-sm border border-rose-100 flex flex-col items-center justify-center text-center shrink-0 min-w-0 sm:min-w-[180px]">
                    <p className="text-[7px] sm:text-[8px] font-black text-rose-400 uppercase tracking-[0.2em] mb-1">Measured ATR</p>
                    <div className="flex items-baseline justify-center gap-0.5 mb-3">
                      <span className="text-4xl sm:text-5xl font-black text-slate-900 leading-none">{Math.abs(currentAngle).toFixed(1)}</span>
                      <span className="text-sm sm:text-lg font-bold text-rose-500">°</span>
                    </div>
                    {/* Result Badge - Target for onclone remove bubble */}
                    <div className="px-6 py-2 bg-rose-50 rounded-[2rem] border border-rose-100 flex items-center justify-center min-w-[120px] mx-auto result-label-container">
                       <p className="text-[9px] sm:text-[10px] font-black text-rose-700 uppercase tracking-widest leading-none whitespace-nowrap">
                         {currentAngle < -0.5 ? 'Left Rotation' : currentAngle > 0.5 ? 'Right Rotation' : 'Neutral'}
                       </p>
                    </div>
                  </div>

                  {/* Analysis Content */}
                  <div className="flex flex-col flex-1 overflow-hidden min-h-0">
                    {isLoadingAnalysis ? (
                      <div className="flex-1 bg-white rounded-xl p-4 border border-rose-100 flex flex-col items-center justify-center gap-2">
                        <div className="w-6 h-6 border-2 border-rose-100 border-t-rose-600 rounded-full animate-spin"></div>
                        <p className="text-[8px] font-black text-rose-600 animate-pulse uppercase">วิเคราะห์ผล...</p>
                      </div>
                    ) : (
                      <div className="flex-1 bg-white rounded-xl p-3 border border-rose-100 flex flex-col shadow-sm overflow-hidden min-h-0">
                        {/* Status Badge - Target for onclone remove bubble */}
                        <div className="mb-2 flex justify-start items-center shrink-0 status-label-container">
                          <span className="text-[8px] font-black bg-slate-900 text-white px-3 py-1.5 rounded-[1rem] uppercase whitespace-nowrap">
                            การแปลผล
                          </span>
                        </div>
                        
                        <div className="flex-1 space-y-2 overflow-y-auto pr-1 custom-scrollbar">
                          <div className="border-l-4 border-rose-500 pl-3 py-1">
                            <p className="text-[10px] sm:text-[11px] font-bold text-slate-800 leading-normal italic break-words">"{analysis?.summary}"</p>
                          </div>
                          
                          <div className="flex flex-col gap-2">
                            <div className="p-2.5 bg-rose-50/50 rounded-xl border border-rose-100">
                              <h4 className="text-[7px] font-black text-rose-400 uppercase tracking-widest mb-1">ความเห็นเพิ่มเติม</h4>
                              <p className="text-[9px] sm:text-[10px] font-bold text-slate-700 leading-snug break-words">{analysis?.researchData?.cobbPrediction}</p>
                            </div>
                            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                              <h4 className="text-[7px] font-black text-slate-400 uppercase tracking-widest mb-1">Progression</h4>
                              <p className="text-[9px] sm:text-[10px] font-bold text-slate-600 leading-snug break-words">{analysis?.researchData?.mcidInfo}</p>
                            </div>
                          </div>
                        </div>

                        <div className="mt-2 pt-1 border-t border-slate-50 flex justify-between items-center shrink-0">
                           <div className="flex gap-1 flex-wrap">
                              {analysis?.researchData?.citations?.map((c: string, i: number) => (
                                <span key={i} className="text-[7px] font-black text-slate-400 uppercase">[{c}]</span>
                              ))}
                           </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="mt-2 shrink-0">
                   <Disclaimer />
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {appState === AppState.RESULTS && (
        <div className="grid grid-cols-2 gap-2 shrink-0 px-2 pb-2 pt-0.5 bg-[#fffafa] z-50">
           <button onClick={resetMeasurement} className="py-2.5 bg-slate-900 text-white font-black rounded-lg shadow-md active:scale-95 transition-all text-[9px] uppercase tracking-[0.1em]">
              วัดครั้งใหม่
           </button>
           <button onClick={saveAsImage} className="py-2.5 bg-rose-600 text-white font-black rounded-lg shadow-md active:scale-95 transition-all text-[9px] uppercase tracking-[0.1em] flex items-center justify-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
              บันทึกรูปภาพ
           </button>
        </div>
      )}

      {showInstructions && <InstructionsModal onClose={() => setShowInstructions(false)} />}
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 250, 250, 0.5);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #fecdd3;
          border-radius: 10px;
          border: 2px solid #fffafa;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #fda4af;
        }
        @media (orientation: portrait) {
          .portrait-only {
            display: flex !important;
          }
        }
        @media (orientation: landscape) {
          .portrait-only {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default App;
